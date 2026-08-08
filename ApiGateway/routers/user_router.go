package routers

import (
	"ApiGateway/controllers"
	"ApiGateway/dto"
	"ApiGateway/middlewares"
	"ApiGateway/utils"

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
	// Public routes
	r.With(middlewares.ValidateBody[dto.RegisterUserRequestDTO]()).Post("/signup", utils.APIHandler(ur.UserController.RegisterUser))
	r.With(middlewares.ValidateBody[dto.LoginUserRequestDTO]()).Post("/signin", utils.APIHandler(ur.UserController.LoginUser))

	// Protected routes (Require JWT Authentication)
	r.Group(func(protected chi.Router) {
		protected.Use(middlewares.RequireAuth)
		protected.Get("/users/profile", utils.APIHandler(ur.UserController.GetMe))
		protected.Get("/users/{id}", utils.APIHandler(ur.UserController.GetUserByID))
	})
}