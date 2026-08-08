package middlewares

import (
	env "ApiGateway/config/env"
	"ApiGateway/utils"
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserIDKey    contextKey = "user_id"
	UserEmailKey contextKey = "user_email"
)

// RequireAuth is a middleware that enforces JWT authentication on protected routes.
func RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			utils.WriteAppError(w, utils.NewUnauthorizedError("Authorization token required"))
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
			}
			return []byte(env.GetString("JWT_SECRET", "TOKEN_SECRET")), nil
		})

		if err != nil || !token.Valid {
			utils.WriteAppError(w, utils.NewUnauthorizedError("Invalid or expired authorization token"))
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			utils.WriteAppError(w, utils.NewUnauthorizedError("Invalid token claims"))
			return
		}

		ctx := r.Context()
		if userID, exists := claims["user_id"]; exists {
			ctx = context.WithValue(ctx, UserIDKey, userID)
		}
		if email, exists := claims["email"]; exists {
			ctx = context.WithValue(ctx, UserEmailKey, email)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// GetUserIDFromContext retrieves the authenticated user ID from context.
func GetUserIDFromContext(ctx context.Context) (int64, bool) {
	val := ctx.Value(UserIDKey)
	if val == nil {
		return 0, false
	}
	switch v := val.(type) {
	case float64:
		return int64(v), true
	case int64:
		return v, true
	case int:
		return int64(v), true
	default:
		return 0, false
	}
}

// GetUserEmailFromContext retrieves the authenticated user email from context.
func GetUserEmailFromContext(ctx context.Context) (string, bool) {
	val, ok := ctx.Value(UserEmailKey).(string)
	return val, ok
}
