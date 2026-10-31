package routers

import (
	"ApiGateway/controllers"
	"ApiGateway/middlewares"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter(routers ...Router) *chi.Mux {
	chiRouter := chi.NewRouter()
	chiRouter.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Correlation-ID", "X-User-ID", "X-User-Email"},
		ExposedHeaders:   []string{"Link", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-Correlation-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	chiRouter.Use(middleware.Logger)
	chiRouter.Use(middleware.Recoverer)
	chiRouter.Use(middlewares.RateLimit(60, 10)) // 60 requests/min, 10 burst per IP

	chiRouter.Get("/ping", controllers.PingHandler)
	for _, r := range routers {
		r.Register(chiRouter)
	}
	return chiRouter
}
