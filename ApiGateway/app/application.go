package app

import (
	dbConfig "ApiGateway/config/db"
	config "ApiGateway/config/env"
	"ApiGateway/controllers"
	db "ApiGateway/db/repositories"
	repo "ApiGateway/db/repositories"
	"ApiGateway/routers"
	"ApiGateway/services"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Config struct{
	Addr string
}


type Application struct{
	Config Config
	Store repo.Storage
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
	db,err:=dbConfig.SetupDB()
	if err!=nil{
		fmt.Println("Error setting up database",err)
		return err
	}

	// Setup users table schema on startup
	query := `CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY, 
		name VARCHAR(255), 
		email VARCHAR(255) UNIQUE, 
		password VARCHAR(255),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
	)`
	if _, err := db.Exec(query); err != nil {
		log.Println("Error creating table users:", err)
		return err
	}

	userRepository := repo.NewUserRepository(db)
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