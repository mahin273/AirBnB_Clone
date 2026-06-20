package utils

import (
	"encoding/json"
	"net/http"
)

// ReadJSON decodes the JSON request body into the target structure.
func ReadJSON(r *http.Request, data interface{}) error {
	return json.NewDecoder(r.Body).Decode(data)
}

// WriteJSON encodes the data to JSON and writes it to the response with the status code.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(data)
}

// WriteError sends a JSON formatted error response.
func WriteError(w http.ResponseWriter, status int, err error) {
	type errResp struct {
		Error string `json:"error"`
	}
	WriteJSON(w, status, errResp{Error: err.Error()})
}
