package routers

import (
	"ApiGateway/controllers"
	"ApiGateway/dto"
	"ApiGateway/middlewares"
	"net/http"

	"github.com/go-chi/chi/v5"
)

type UserRouter struct {
	UserController *controllers.UserController
}

func NewUserRouter(_userController *controllers.UserController) Router {
	return &UserRouter{
		UserController: _userController,
	}
}

func (ur *UserRouter) Register(r chi.Router) {
	r.With(middlewares.ValidateBody[dto.RegisterUserRequestDTO]()).Post("/signup", func(w http.ResponseWriter, r *http.Request) {
		ur.UserController.RegisterUser(w, r)
	})
	r.With(middlewares.ValidateBody[dto.LoginUserRequestDTO]()).Post("/signin", func(w http.ResponseWriter, r *http.Request) {
		ur.UserController.LoginUser(w, r)
	})
	r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
		ur.UserController.GetUserByID(w, r)
	})
}