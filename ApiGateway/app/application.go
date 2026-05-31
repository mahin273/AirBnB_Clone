package app

import (
	config "ApiGateway/config/env"
	"ApiGateway/controllers"
	db "ApiGateway/db/repositories"
	"ApiGateway/routers"
	"ApiGateway/services"
	"log"
	"net/http"
	"time"
)

type Config struct{
	Addr string
}


type Application struct{
	Config Config
	Store db.Storage
}

func NewConfig() Config{
	port := config.GetString("PORT",":8080")
	return Config{
		Addr: port,
	}
}

func NewApplication(cfg Config) *Application{
	return &Application{
		Config: cfg,
		Store:  *db.NewStorage(),
	}
}

func (app *Application) Run() error{
	userRepository := db.NewStorage().UserRepository
	userService := services.NewUserService(userRepository)
	userController := controllers.NewUserController(userService)
	userRouter := routers.NewUserRouter(userController)

	server := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      routers.SetupRouter(userRouter),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Starting server on ", app.Config.Addr)

	return server.ListenAndServe()
}