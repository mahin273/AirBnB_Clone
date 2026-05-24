package main

import (
	"ApiGateway/app"
	"log"
)

func main() {
	cfg := app.Config{
		Addr: ":3001",
	}
	application := app.Application{
		Config: cfg,
	}

	if err := application.Run(); err != nil {
		log.Fatal(err)
	}
}
 