package middlewares

import (
	"ApiGateway/utils"
	"fmt"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)


// clientBucket holds rate limiting state for a single client IP.
type clientBucket struct {
	tokens     float64
	lastRefill time.Time
	lastSeen   time.Time
}

// IPRateLimiter manages IP-based rate limiting buckets safely across concurrent goroutines.
type IPRateLimiter struct {
	mu           sync.RWMutex
	clients      map[string]*clientBucket
	ratePerSec   float64
	burst        float64
	ttl          time.Duration
}

// NewIPRateLimiter creates a rate limiter with specified requests per minute, burst allowance, and TTL cleanup.
func NewIPRateLimiter(requestsPerMin int, burst int) *IPRateLimiter {
	limiter := &IPRateLimiter{
		clients:    make(map[string]*clientBucket),
		ratePerSec: float64(requestsPerMin) / 60.0,
		burst:      float64(burst),
		ttl:        3 * time.Minute,
	}

	// Start background cleanup ticker to prevent memory leaks from inactive IPs
	go limiter.cleanupClients()

	return limiter
}

// cleanupClients periodically removes client buckets that haven't been seen within the TTL duration.
func (l *IPRateLimiter) cleanupClients() {
	ticker := time.NewTicker(1 * time.Minute)
	for range ticker.C {
		l.mu.Lock()
		now := time.Now()
		for ip, client := range l.clients {
			if now.Sub(client.lastSeen) > l.ttl {
				delete(l.clients, ip)
			}
		}
		l.mu.Unlock()
	}
}

// GetClientIP extracts the real client IP address considering proxy headers.
func GetClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (comma-separated list of IPs)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			clientIP := strings.TrimSpace(ips[0])
			if clientIP != "" {
				return clientIP
			}
		}
	}

	// Check X-Real-IP header
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}

	// Fallback to RemoteAddr (host:port)
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}

// Allow checks whether a client IP has available tokens, refilling tokens based on elapsed time.
func (l *IPRateLimiter) Allow(ip string) (bool, int, int) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := time.Now()
	client, exists := l.clients[ip]
	if !exists {
		client = &clientBucket{
			tokens:     l.burst,
			lastRefill: now,
			lastSeen:   now,
		}
		l.clients[ip] = client
	}

	// Refill tokens based on elapsed time
	elapsed := now.Sub(client.lastRefill).Seconds()
	client.tokens += elapsed * l.ratePerSec
	if client.tokens > l.burst {
		client.tokens = l.burst
	}
	client.lastRefill = now
	client.lastSeen = now

	limitInt := int(l.burst)
	if client.tokens >= 1.0 {
		client.tokens -= 1.0
		remaining := int(client.tokens)
		return true, limitInt, remaining
	}

	remaining := int(client.tokens)
	return false, limitInt, remaining
}

// RateLimit returns a middleware that enforces rate limiting per client IP.
func RateLimit(requestsPerMin int, burst int) func(http.Handler) http.Handler {
	limiter := NewIPRateLimiter(requestsPerMin, burst)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			clientIP := GetClientIP(r)
			allowed, limit, remaining := limiter.Allow(clientIP)

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

			if !allowed {
				log.Printf("[RATE LIMIT EXCEEDED] IP: %s - Limit: %d, Remaining: %d\n", clientIP, limit, remaining)
				w.Header().Set("Retry-After", "60")
				utils.WriteAppError(w, utils.NewAppError(
					http.StatusTooManyRequests,
					"Too Many Requests",
					"Rate limit exceeded. Please try again later.",
					nil,
				))
				return
			}


			next.ServeHTTP(w, r)
		})
	}
}
