package utils

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"
)

// PathRewriteFunc transforms inbound URL paths before dispatching to downstream targets.
type PathRewriteFunc func(inboundPath string) string

// PrefixRewriter returns a PathRewriteFunc that replaces oldPrefix with newPrefix.
func PrefixRewriter(oldPrefix, newPrefix string) PathRewriteFunc {
	return func(inboundPath string) string {
		if strings.HasPrefix(inboundPath, oldPrefix) {
			return newPrefix + strings.TrimPrefix(inboundPath, oldPrefix)
		}
		return inboundPath
	}
}

// NewReverseProxy creates a reverse proxy handler that forwards requests to targetURL,
// cleanses untrusted client identity headers, injects authenticated user context headers
// (X-User-ID, X-User-Email), and optionally applies path rewriting.
func NewReverseProxy(targetURL string, rewrite ...PathRewriteFunc) (http.HandlerFunc, error) {
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, fmt.Errorf("invalid proxy target URL '%s': %w", targetURL, err)
	}

	proxy := &httputil.ReverseProxy{}

	// Configure pooled HTTP transport for persistent downstream socket reuse
	proxy.Transport = &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: (&net.Dialer{
			Timeout:   10 * time.Second,
			KeepAlive: 30 * time.Second,
		}).DialContext,
		ForceAttemptHTTP2:     true,
		MaxIdleConns:          100,
		MaxIdleConnsPerHost:   20,
		IdleConnTimeout:       90 * time.Second,
		TLSHandshakeTimeout:   10 * time.Second,
		ExpectContinueTimeout: 1 * time.Second,
		ResponseHeaderTimeout: 15 * time.Second,
	}

	// Customize Rewrite to forward headers, sanitize identity, and rewrite paths
	proxy.Rewrite = func(r *httputil.ProxyRequest) {
		r.SetURL(parsedURL)

		// Optional path rewriting
		if len(rewrite) > 0 && rewrite[0] != nil {
			r.Out.URL.Path = rewrite[0](r.In.URL.Path)
			r.Out.URL.RawPath = ""
		}

		// Preserve inbound query parameters verbatim
		r.Out.URL.RawQuery = r.In.URL.RawQuery

		// Strip untrusted client identity headers to prevent header spoofing
		r.Out.Header.Del("X-User-ID")
		r.Out.Header.Del("X-User-Email")

		// Forward tracing header if present
		if correlationID := r.In.Header.Get("X-Correlation-ID"); correlationID != "" {
			r.Out.Header.Set("X-Correlation-ID", correlationID)
		}

		// Inject authenticated User ID if present in request context
		if userID, ok := GetUserIDFromContext(r.In.Context()); ok {
			r.Out.Header.Set("X-User-ID", fmt.Sprintf("%d", userID))
		}

		// Inject authenticated User Email if present in request context
		if email, ok := GetUserEmailFromContext(r.In.Context()); ok {
			r.Out.Header.Set("X-User-Email", email)
		}
	}

	// Handle connection failures when downstream microservice is offline
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("[PROXY ERROR] Target: %s - Error: %v\n", targetURL, err)
		WriteAppError(w, NewAppError(
			http.StatusBadGateway,
			"Bad Gateway",
			fmt.Sprintf("Downstream service at %s is unavailable", targetURL),
			err,
		))
	}

	return func(w http.ResponseWriter, r *http.Request) {
		proxy.ServeHTTP(w, r)
	}, nil
}
