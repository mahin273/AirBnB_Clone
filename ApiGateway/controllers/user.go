package controllers

import (
	"ApiGateway/dto"
	"ApiGateway/middlewares"
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
		return utils.NewBadRequestError("Malformed JSON request body: " + err.Error())
	}

	user := &models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
	}

	if err := uc.UserService.CreateUser(user); err != nil {
		return utils.NewInternalServerError(err)
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
		return utils.NewBadRequestError("Invalid user ID")
	}

	user, err := uc.UserService.GetUserByID(id)
	if err != nil {
		if err.Error() == "user not found" {
			return utils.NewNotFoundError("User not found")
		}
		return utils.NewInternalServerError(err)
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

func (uc *UserController) GetMe(w http.ResponseWriter, r *http.Request) error {
	userID, ok := middlewares.GetUserIDFromContext(r.Context())
	if !ok {
		return utils.NewUnauthorizedError("Unauthorized")
	}

	user, err := uc.UserService.GetUserByID(userID)
	if err != nil {
		if err.Error() == "user not found" {
			return utils.NewNotFoundError("User profile not found")
		}
		return utils.NewInternalServerError(err)
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
		return utils.NewBadRequestError("Malformed JSON request body: " + err.Error())
	}

	tokenString, err := uc.UserService.LoginUser(req.Email, req.Password)
	if err != nil {
		return utils.NewUnauthorizedError("Invalid email or password")
	}

	return utils.WriteJSON(w, http.StatusOK, map[string]string{
		"token": tokenString,
	})
}