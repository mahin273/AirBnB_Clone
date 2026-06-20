package controllers

import (
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

func NewUserController(_userService services.UserService) *UserController{
	return &UserController{
		UserService: _userService,
	}
} 


func(uc *UserController) RegisterUser(w http.ResponseWriter,r * http.Request)error{
	var user models.User
	if err := utils.ReadJSON(r, &user); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return err
	}

	if err := uc.UserService.CreateUser(&user); err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to register user"})
		return err
	}

	return utils.WriteJSON(w, http.StatusCreated, user)
}

func(uc *UserController) GetUserByID(w http.ResponseWriter,r * http.Request)error{
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

	return utils.WriteJSON(w, http.StatusOK, user)
}

func(uc *UserController) LoginUser(w http.ResponseWriter, r *http.Request) error {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

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