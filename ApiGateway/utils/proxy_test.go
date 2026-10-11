package utils

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestReverseProxy_HeaderCleansingAndInjection(t *testing.T) {
	var receivedUserID string
	var receivedUserEmail string
	var receivedCorrelationID string

	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedUserID = r.Header.Get("X-User-ID")
		receivedUserEmail = r.Header.Get("X-User-Email")
		receivedCorrelationID = r.Header.Get("X-Correlation-ID")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}))
	defer backend.Close()

	proxyHandler, err := NewReverseProxy(backend.URL)
	if err != nil {
		t.Fatalf("unexpected error creating proxy: %v", err)
	}

	t.Run("Sanitizes client spoofed headers when unauthenticated", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-User-ID", "999")
		req.Header.Set("X-User-Email", "hacker@example.com")
		req.Header.Set("X-Correlation-ID", "corr-123")
		rec := httptest.NewRecorder()

		proxyHandler(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if receivedUserID != "" {
			t.Errorf("expected X-User-ID to be stripped, got '%s'", receivedUserID)
		}
		if receivedUserEmail != "" {
			t.Errorf("expected X-User-Email to be stripped, got '%s'", receivedUserEmail)
		}
		if receivedCorrelationID != "corr-123" {
			t.Errorf("expected correlation ID 'corr-123', got '%s'", receivedCorrelationID)
		}
	})

	t.Run("Injects authenticated user context headers", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-User-ID", "999") // Should be overwritten by context
		ctx := context.WithValue(req.Context(), UserIDKey, int64(42))
		ctx = context.WithValue(ctx, UserEmailKey, "alice@example.com")
		req = req.WithContext(ctx)
		rec := httptest.NewRecorder()

		proxyHandler(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if receivedUserID != "42" {
			t.Errorf("expected X-User-ID '42', got '%s'", receivedUserID)
		}
		if receivedUserEmail != "alice@example.com" {
			t.Errorf("expected X-User-Email 'alice@example.com', got '%s'", receivedUserEmail)
		}
	})
}

func TestReverseProxy_PathRewritingAndQueryParams(t *testing.T) {
	var receivedPath string
	var receivedQuery string

	backend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		receivedPath = r.URL.Path
		receivedQuery = r.URL.RawQuery
		w.WriteHeader(http.StatusOK)
	}))
	defer backend.Close()

	rewriter := PrefixRewriter("/properties", "/api/v1/apartments")
	proxyHandler, err := NewReverseProxy(backend.URL, rewriter)
	if err != nil {
		t.Fatalf("unexpected error creating proxy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/properties/12?view=full&active=true", nil)
	rec := httptest.NewRecorder()

	proxyHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected 200 OK, got %d", rec.Code)
	}
	if receivedPath != "/api/v1/apartments/12" {
		t.Errorf("expected path '/api/v1/apartments/12', got '%s'", receivedPath)
	}
	if receivedQuery != "view=full&active=true" {
		t.Errorf("expected query 'view=full&active=true', got '%s'", receivedQuery)
	}
}

func TestReverseProxy_DownstreamOfflineReturns502(t *testing.T) {
	// Point to a non-existent port to simulate offline downstream microservice
	proxyHandler, err := NewReverseProxy("http://127.0.0.1:59999")
	if err != nil {
		t.Fatalf("unexpected error creating proxy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	rec := httptest.NewRecorder()

	proxyHandler(rec, req)

	if rec.Code != http.StatusBadGateway {
		t.Errorf("expected status 502 Bad Gateway, got %d", rec.Code)
	}

	body, err := io.ReadAll(rec.Body)
	if err != nil {
		t.Fatalf("failed to read response body: %v", err)
	}

	var appErr AppError
	if err := json.Unmarshal(body, &appErr); err != nil {
		t.Fatalf("response body is not valid JSON AppError: %v", err)
	}

	if appErr.StatusCode != http.StatusBadGateway {
		t.Errorf("expected AppError status 502, got %d", appErr.StatusCode)
	}
	if appErr.Title != "Bad Gateway" {
		t.Errorf("expected title 'Bad Gateway', got '%s'", appErr.Title)
	}
}
