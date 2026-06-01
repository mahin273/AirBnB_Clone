package config

import (
	env "ApiGateway/config/env"
	"database/sql"
	"fmt"
	"github.com/go-sql-driver/mysql"
) 


func SetupDB() (*sql.DB,error){
	cfg:= mysql.NewConfig()
	cfg.User = env.GetString("DB_USER","root")
	cfg.Passwd = env.GetString("DB_PASSWORD","")
	cfg.Net = env.GetString("DB_NET","tcp")
	cfg.Addr = env.GetString("DB_ADDR","127.0.0.1:3306")
	cfg.DBName = env.GetString("DB_NAME","")
	cfg.ParseTime=true

	fmt.Println("Connecting to database",cfg.DBName,cfg.FormatDSN())

	db,err:=sql.Open("mysql",cfg.FormatDSN())
	if err!=nil{
		fmt.Println("Error connecting to database",err)
		return nil,err
	}

	fmt.Println("Successfully connected to database")
	
	pingError:= db.Ping()
	if pingError!=nil{
		fmt.Println("Error pinging database",pingError)
		return nil,pingError
	}
	fmt.Println("Successfully pinged database")
	return db,nil
}