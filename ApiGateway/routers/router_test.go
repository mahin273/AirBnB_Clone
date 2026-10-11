package routers

import (
	env "ApiGateway/config/env"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func generateTestToken(userID int64, email string) string {
	payload := jwt.MapClaims{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	tokenString, _ := token.SignedString([]byte(env.GetString("JWT_SECRET", "TOKEN_SECRET")))
	return tokenString
}

func TestApartmentRouter_Routes(t *testing.T) {
	var lastReceivedPath string
	var lastReceivedMethod string
	var lastReceivedUserID string

	aptBackend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lastReceivedPath = r.URL.Path
		lastReceivedMethod = r.Method
		lastReceivedUserID = r.Header.Get("X-User-ID")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}))
	defer aptBackend.Close()

	os.Setenv("APARTMENT_SERVICE_URL", aptBackend.URL)

	aptRouter := NewApartmentRouter()
	chiMux := SetupRouter(aptRouter)

	t.Run("Public GET /api/v1/apartments succeeds without token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/apartments", nil)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if lastReceivedPath != "/api/v1/apartments" {
			t.Errorf("expected path '/api/v1/apartments', got '%s'", lastReceivedPath)
		}
		if lastReceivedMethod != http.MethodGet {
			t.Errorf("expected method GET, got '%s'", lastReceivedMethod)
		}
		if lastReceivedUserID != "" {
			t.Errorf("expected empty user ID for public request, got '%s'", lastReceivedUserID)
		}
	})

	t.Run("Protected POST /api/v1/apartments rejected with 401 when missing token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/apartments", nil)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", rec.Code)
		}
	})

	t.Run("Protected POST /api/v1/apartments succeeds with valid token", func(t *testing.T) {
		token := generateTestToken(501, "host@example.com")
		req := httptest.NewRequest(http.MethodPost, "/api/v1/apartments", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if lastReceivedUserID != "501" {
			t.Errorf("expected user ID '501', got '%s'", lastReceivedUserID)
		}
	})

	t.Run("Legacy /properties/42 rewritten to /api/v1/apartments/42", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/properties/42", nil)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if lastReceivedPath != "/api/v1/apartments/42" {
			t.Errorf("expected rewritten path '/api/v1/apartments/42', got '%s'", lastReceivedPath)
		}
	})
}

func TestBookingRouter_Routes(t *testing.T) {
	var lastReceivedPath string
	var lastReceivedUserID string

	bookingBackend := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lastReceivedPath = r.URL.Path
		lastReceivedUserID = r.Header.Get("X-User-ID")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"booked"}`))
	}))
	defer bookingBackend.Close()

	os.Setenv("BOOKING_SERVICE_URL", bookingBackend.URL)

	bookingRouter := NewBookingRouter()
	chiMux := SetupRouter(bookingRouter)

	t.Run("GET /api/v1/bookings/my-bookings rejected with 401 when missing token", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/bookings/my-bookings", nil)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Errorf("expected 401 Unauthorized, got %d", rec.Code)
		}
	})

	t.Run("POST /api/v1/bookings succeeds and injects user context with valid token", func(t *testing.T) {
		token := generateTestToken(777, "guest@example.com")
		req := httptest.NewRequest(http.MethodPost, "/api/v1/bookings", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		rec := httptest.NewRecorder()

		chiMux.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 OK, got %d", rec.Code)
		}
		if lastReceivedPath != "/api/v1/bookings" {
			t.Errorf("expected path '/api/v1/bookings', got '%s'", lastReceivedPath)
		}
		if lastReceivedUserID != "777" {
			t.Errorf("expected user ID '777', got '%s'", lastReceivedUserID)
		}
	})
}
