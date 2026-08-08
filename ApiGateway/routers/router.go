package routers

import (
	"ApiGateway/controllers"
	"ApiGateway/middlewares"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter(userRouter Router) *chi.Mux {
	chiRouter := chi.NewRouter()
	chiRouter.Use(middleware.Logger)
	chiRouter.Use(middleware.Recoverer)
	chiRouter.Use(middlewares.RateLimit(60, 10)) // 60 requests/min, 10 burst per IP

	chiRouter.Get("/ping", controllers.PingHandler)
	userRouter.Register(chiRouter)
	return chiRouter
}