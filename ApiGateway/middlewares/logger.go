package middlewares

import (
	"fmt"
	"net/http"
	"time"
)

func RequestLogger(next http.Handler) http.Handler{
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request){
		startTime:=time.Now()

		next.ServeHTTP(w,r)

		fmt.Printf("%s %s %s\n", r.Method, r.URL.Path, time.Since(startTime))
	})
}