package utils

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// NewReverseProxy creates a reverse proxy handler that forwards requests to targetURL
// and injects authenticated user context headers (X-User-ID, X-User-Email).
func NewReverseProxy(targetURL string) (http.HandlerFunc, error) {
	parsedURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, fmt.Errorf("invalid proxy target URL '%s': %w", targetURL, err)
	}

	proxy := httputil.NewSingleHostReverseProxy(parsedURL)

	// Customize Rewrite to forward headers and inject User identity
	proxy.Rewrite = func(r *httputil.ProxyRequest) {
		r.SetURL(parsedURL)

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
