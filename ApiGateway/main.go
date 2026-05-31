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

	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
