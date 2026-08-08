package middlewares

import (
	"ApiGateway/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
)

// FormatValidationError converts validator.ValidationErrors into human-readable messages.
func FormatValidationError(err error) string {
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		var errMsgs []string
		for _, e := range validationErrs {
			errMsgs = append(errMsgs, fmt.Sprintf("field '%s' failed on rule '%s'", e.Field(), e.Tag()))
		}
		return strings.Join(errMsgs, "; ")
	}
	return err.Error()
}

// ValidateBody is a generic middleware that validates request JSON against struct type T before invoking downstream handlers.
func ValidateBody[T any]() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body == nil {
				utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Request body cannot be empty"})
				return
			}

			bodyBytes, err := io.ReadAll(r.Body)
			if err != nil || len(bytes.TrimSpace(bodyBytes)) == 0 {
				utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Request body cannot be empty"})
				return
			}

			// RESTORE r.Body so downstream controller handlers can read it!
			r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

			var payload T
			if err := json.Unmarshal(bodyBytes, &payload); err != nil {
				utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON format: " + err.Error()})
				return
			}

			// Validate struct rules
			if err := utils.Validator.Struct(&payload); err != nil {
				utils.WriteJSON(w, http.StatusUnprocessableEntity, map[string]string{
					"error": FormatValidationError(err),
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
