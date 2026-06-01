package main

import (
	"ApiGateway/app"

	config "ApiGateway/config/env"
)

func main() {
	config.Load()


	

	
	cfg := app.NewConfig()
	app := app.NewApplication(cfg)	
	app.Run()

	// if err := application.Run(); err != nil {
	// 	log.Fatal(err)
	// }
}
