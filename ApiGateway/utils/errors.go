package utils

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
)

// AppError represents a standardized custom application error.
type AppError struct {
	StatusCode int    `json:"status"`
	Title      string `json:"error"`
	Message    string `json:"message"`
	Timestamp  string `json:"timestamp"`
	Err        error  `json:"-"`
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}
	return e.Message
}

func NewAppError(statusCode int, title, message string, err error) *AppError {
	return &AppError{
		StatusCode: statusCode,
		Title:      title,
		Message:    message,
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		Err:        err,
	}
}

func NewBadRequestError(message string) *AppError {
	return NewAppError(http.StatusBadRequest, "Bad Request", message, nil)
}

func NewUnauthorizedError(message string) *AppError {
	return NewAppError(http.StatusUnauthorized, "Unauthorized", message, nil)
}

func NewNotFoundError(message string) *AppError {
	return NewAppError(http.StatusNotFound, "Not Found", message, nil)
}

func NewUnprocessableEntityError(message string) *AppError {
	return NewAppError(http.StatusUnprocessableEntity, "Unprocessable Entity", message, nil)
}

func NewInternalServerError(err error) *AppError {
	msg := "An internal server error occurred"
	return NewAppError(http.StatusInternalServerError, "Internal Server Error", msg, err)
}

// WriteAppError writes a uniform JSON error response to http.ResponseWriter.
func WriteAppError(w http.ResponseWriter, err error) {
	var appErr *AppError
	if !errors.As(err, &appErr) {
		appErr = NewInternalServerError(err)
	}

	if appErr.StatusCode >= 500 && appErr.Err != nil {
		log.Printf("[INTERNAL ERROR] %v\n", appErr.Err)
	}

	WriteJSON(w, appErr.StatusCode, appErr)
}

// APIHandler converts a handler function returning error into standard http.HandlerFunc.
func APIHandler(fn func(w http.ResponseWriter, r *http.Request) error) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := fn(w, r); err != nil {
			WriteAppError(w, err)
		}
	}
}
