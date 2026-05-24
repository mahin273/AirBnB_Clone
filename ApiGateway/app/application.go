package app

import (
	"log"
	"net/http"
	"time"
)

type Config struct{
	Addr string
}


type Application struct{
	Config Config
}

func (app *Application) Run() error{
	server := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      nil, //TODO: setup a chi router and put here
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Println("Starting server on ", app.Config.Addr)

	return server.ListenAndServe()
}