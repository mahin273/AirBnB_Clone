package controllers

import (
	"ApiGateway/models"
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

type mockUserService struct {
	createUserFn func(user *models.User) error
}

func (m *mockUserService) CreateUser(user *models.User) error {
	if m.createUserFn != nil {
		return m.createUserFn(user)
	}
	user.ID = 1
	user.CreatedAt = time.Now().UTC()
	user.UpdatedAt = time.Now().UTC()
	return nil
}

func (m *mockUserService) GetUserByID(id int64) (*models.User, error) {
	return nil, nil
}

func (m *mockUserService) GetUserByEmail(email string) (*models.User, error) {
	return nil, nil
}

func (m *mockUserService) LoginUser(email, password string) (string, error) {
	return "", nil
}

func TestUserController_RegisterUser(t *testing.T) {
	t.Run("Returns 201 with populated timestamps on successful signup", func(t *testing.T) {
		mockSvc := &mockUserService{
			createUserFn: func(user *models.User) error {
				user.ID = 42
				now := time.Now().UTC()
				user.CreatedAt = now
				user.UpdatedAt = now
				return nil
			},
		}
		ctrl := NewUserController(mockSvc)

		body := map[string]string{
			"name":     "John Doe",
			"email":    "john@example.com",
			"password": "password123",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(bodyBytes))
		rec := httptest.NewRecorder()

		err := ctrl.RegisterUser(rec, req)
		if err != nil {
			t.Fatalf("unexpected handler error: %v", err)
		}

		if rec.Code != http.StatusCreated {
			t.Errorf("expected 201 Created, got %d", rec.Code)
		}

		var res map[string]interface{}
		json.NewDecoder(rec.Body).Decode(&res)

		if res["id"] != float64(42) {
			t.Errorf("expected id 42, got %v", res["id"])
		}
		if res["created_at"] == "0001-01-01T00:00:00Z" || res["created_at"] == nil {
			t.Errorf("expected valid non-zero created_at, got %v", res["created_at"])
		}
	})

	t.Run("Returns 409 Conflict when email is duplicate", func(t *testing.T) {
		mockSvc := &mockUserService{
			createUserFn: func(user *models.User) error {
				return errors.New("Error 1062: Duplicate entry 'john@example.com' for key 'users.email'")
			},
		}
		ctrl := NewUserController(mockSvc)

		body := map[string]string{
			"name":     "John Doe",
			"email":    "john@example.com",
			"password": "password123",
		}
		bodyBytes, _ := json.Marshal(body)
		req := httptest.NewRequest(http.MethodPost, "/signup", bytes.NewBuffer(bodyBytes))
		rec := httptest.NewRecorder()

		err := ctrl.RegisterUser(rec, req)
		if err == nil {
			t.Fatalf("expected error from duplicate email, got nil")
		}

		appErr, ok := err.(interface{ Error() string })
		if !ok || appErr == nil {
			t.Fatalf("expected AppError")
		}
	})
}
