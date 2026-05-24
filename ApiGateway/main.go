package main

import (
	"ApiGateway/app"
	"log"
)

func main() {
	cfg := app.NewConfig(":3001")
	application := app.NewApplication(cfg)

	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
 