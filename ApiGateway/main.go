package main

import (
	"ApiGateway/app"
	"log"

	config "ApiGateway/config/env"
	dbConfig "ApiGateway/config/db"
)

func main() {
	config.Load()
	dbConfig.SetupDB()

	

	
	cfg := app.NewConfig()
	application := app.NewApplication(cfg)
	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
