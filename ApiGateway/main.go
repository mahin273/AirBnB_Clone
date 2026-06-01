package main

import (
	"ApiGateway/app"
	"log"

	config "ApiGateway/config/env"
)

func main() {
	config.Load()


	

	
	cfg := app.NewConfig()
	application := app.NewApplication(cfg)	
	application.Run()

	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
