package routers

import (
	"ApiGateway/controllers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Router interface{
	Register(r chi.Router)
}

func SetupRouter(userRouter Router) *chi.Mux {
	chiRouter := chi.NewRouter()
	chiRouter.Use(middleware.Logger)
	chiRouter.Use(middleware.Recoverer)
	chiRouter.Get("/ping", controllers.PingHandler)
	userRouter.Register(chiRouter)
	return chiRouter
}