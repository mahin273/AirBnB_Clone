package middlewares

import (
	"ApiGateway/utils"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

// BuildValidationErrors converts validator.ValidationErrors into a clean field-keyed map.
func BuildValidationErrors(err error) map[string]string {
	fieldErrors := make(map[string]string)
	if validationErrs, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrs {
			field := strings.ToLower(e.Field())
			switch e.Tag() {
			case "required":
				fieldErrors[field] = fmt.Sprintf("%s is required", field)
			case "email":
				fieldErrors[field] = "must be a valid email address"
			case "min":
				fieldErrors[field] = fmt.Sprintf("%s must be at least %s characters long", field, e.Param())
			case "max":
				fieldErrors[field] = fmt.Sprintf("%s must not exceed %s characters", field, e.Param())
			default:
				fieldErrors[field] = fmt.Sprintf("failed validation on rule '%s'", e.Tag())
			}
		}
	} else {
		fieldErrors["payload"] = err.Error()
	}
	return fieldErrors
}

// ValidateBody is a generic middleware that validates request JSON against struct type T before invoking downstream handlers.
func ValidateBody[T any]() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body == nil {
				utils.WriteAppError(w, utils.NewBadRequestError("Request body cannot be empty"))
				return
			}

			bodyBytes, err := io.ReadAll(r.Body)
			if err != nil || len(bytes.TrimSpace(bodyBytes)) == 0 {
				utils.WriteAppError(w, utils.NewBadRequestError("Request body cannot be empty"))
				return
			}

			// RESTORE r.Body so downstream controller handlers can read it!
			r.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

			var payload T
			if err := json.Unmarshal(bodyBytes, &payload); err != nil {
				utils.WriteAppError(w, utils.NewBadRequestError("Invalid JSON format: "+err.Error()))
				return
			}

			// Validate struct rules
			if err := utils.Validator.Struct(&payload); err != nil {
				utils.WriteJSON(w, http.StatusUnprocessableEntity, map[string]interface{}{
					"status":    http.StatusUnprocessableEntity,
					"error":     "Validation Failed",
					"message":   "Invalid request payload",
					"errors":    BuildValidationErrors(err),
					"timestamp": time.Now().UTC().Format(time.RFC3339),
				})
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

