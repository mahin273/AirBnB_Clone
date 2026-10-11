package routers

import (
	env "ApiGateway/config/env"
	"ApiGateway/middlewares"
	"ApiGateway/utils"
	"log"

	"github.com/go-chi/chi/v5"
)

type BookingRouter struct{}

func NewBookingRouter() Router {
	return &BookingRouter{}
}

func (br *BookingRouter) Register(r chi.Router) {
	targetURL := env.GetString("BOOKING_SERVICE_URL", "http://localhost:3001")

	proxyHandler, err := utils.NewReverseProxy(targetURL)
	if err != nil {
		log.Fatalf("Failed to initialize Booking Service reverse proxy: %v", err)
	}

	r.Route("/api/v1/bookings", func(sub chi.Router) {
		sub.Group(func(protected chi.Router) {
			protected.Use(middlewares.RequireAuth)
			protected.Get("/*", proxyHandler)
			protected.Post("/*", proxyHandler)
			protected.Put("/*", proxyHandler)
			protected.Delete("/*", proxyHandler)
		})
	})
}
