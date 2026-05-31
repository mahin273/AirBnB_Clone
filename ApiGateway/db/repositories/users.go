package db

import (
	"database/sql"
	"fmt"
)

type UserRepository interface {
	Create() error
}

type UserRepositoryImpl struct {
	db *sql.DB
}

func (u *UserRepositoryImpl) Create() error {
	fmt.Println("Creating User in UserRepository")
	return nil
}