package controllers

import (
	"ApiGateway/services"
	"net/http"
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
	uc.UserService.CreateUser()
	w.Write([]byte("User Registration Endpoint"))
	return nil
}