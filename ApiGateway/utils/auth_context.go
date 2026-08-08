package utils

import (
	"context"
)

type contextKey string

const (
	UserIDKey    contextKey = "user_id"
	UserEmailKey contextKey = "user_email"
)

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
