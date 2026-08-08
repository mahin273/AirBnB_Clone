package routers

import (
	env "ApiGateway/config/env"
	"ApiGateway/middlewares"
	"ApiGateway/utils"
	"log"

	"github.com/go-chi/chi/v5"
)

type PropertyRouter struct{}

func NewPropertyRouter() Router {
	return &PropertyRouter{}
}

func (pr *PropertyRouter) Register(r chi.Router) {
	targetURL := env.GetString("PROPERTY_SERVICE_URL", "http://localhost:8082")

	proxyHandler, err := utils.NewReverseProxy(targetURL)
	if err != nil {
		log.Fatalf("Failed to initialize Property Service reverse proxy: %v", err)
	}

	// Mount reverse proxy routes for Property Microservice
	r.Route("/properties", func(sub chi.Router) {
		// Public route: GET /properties (View property listings)
		sub.Get("/*", proxyHandler)

		// Protected routes: Require JWT Authentication before reverse proxying
		sub.Group(func(protected chi.Router) {
			protected.Use(middlewares.RequireAuth)
			protected.Post("/*", proxyHandler)
			protected.Put("/*", proxyHandler)
			protected.Delete("/*", proxyHandler)
		})
	})
}
