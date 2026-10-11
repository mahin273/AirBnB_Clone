package routers

import (
	env "ApiGateway/config/env"
	"ApiGateway/middlewares"
	"ApiGateway/utils"
	"log"

	"github.com/go-chi/chi/v5"
)

type ApartmentRouter struct{}

func NewApartmentRouter() Router {
	return &ApartmentRouter{}
}

func (ar *ApartmentRouter) Register(r chi.Router) {
	targetURL := env.GetString("APARTMENT_SERVICE_URL", "http://localhost:3000")

	proxyHandler, err := utils.NewReverseProxy(targetURL)
	if err != nil {
		log.Fatalf("Failed to initialize Apartment Service reverse proxy: %v", err)
	}

	propertyProxyHandler, err := utils.NewReverseProxy(
		targetURL,
		utils.PrefixRewriter("/properties", "/api/v1/apartments"),
	)
	if err != nil {
		log.Fatalf("Failed to initialize Property Service reverse proxy: %v", err)
	}

	resourcePaths := []string{
		"/api/v1/apartments",
		"/api/v1/categories",
		"/api/v1/rooms",
	}

	for _, path := range resourcePaths {
		r.Route(path, func(sub chi.Router) {
			sub.Get("/*", proxyHandler)

			sub.Group(func(protected chi.Router) {
				protected.Use(middlewares.RequireAuth)
				protected.Post("/*", proxyHandler)
				protected.Put("/*", proxyHandler)
				protected.Delete("/*", proxyHandler)
			})
		})
	}

	r.Route("/properties", func(sub chi.Router) {
		sub.Get("/*", propertyProxyHandler)

		sub.Group(func(protected chi.Router) {
			protected.Use(middlewares.RequireAuth)
			protected.Post("/*", propertyProxyHandler)
			protected.Put("/*", propertyProxyHandler)
			protected.Delete("/*", propertyProxyHandler)
		})
	})
}
