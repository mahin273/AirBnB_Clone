package controllers

import (
	"ApiGateway/dto"
	"ApiGateway/models"
	"ApiGateway/services"
	"ApiGateway/utils"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type UserController struct {
	UserService services.UserService
}

func NewUserController(_userService services.UserService) *UserController {
	return &UserController{
		UserService: _userService,
	}
}

func (uc *UserController) RegisterUser(w http.ResponseWriter, r *http.Request) error {
	var req dto.RegisterUserRequestDTO
	if err := utils.ReadJSON(r, &req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return err
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	if err := uc.UserService.CreateUser(user); err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to register user"})
		return err
	}

	res := dto.UserResponseDTO{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	return utils.WriteJSON(w, http.StatusCreated, res)
}

func (uc *UserController) GetUserByID(w http.ResponseWriter, r *http.Request) error {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
		return err
	}

	user, err := uc.UserService.GetUserByID(id)
	if err != nil {
		if err.Error() == "user not found" {
			utils.WriteJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
			return err
		}
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to retrieve user"})
		return err
	}

	res := dto.UserResponseDTO{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
		UpdatedAt: user.UpdatedAt,
	}

	return utils.WriteJSON(w, http.StatusOK, res)
}

func (uc *UserController) LoginUser(w http.ResponseWriter, r *http.Request) error {
	var req dto.LoginUserRequestDTO

	if err := utils.ReadJSON(r, &req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return err
	}

	tokenString, err := uc.UserService.LoginUser(req.Email, req.Password)
	if err != nil {
		utils.WriteJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid email or password"})
		return err
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{
		"token": tokenString,
	})
}