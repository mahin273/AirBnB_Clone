package utils

import "golang.org/x/crypto/bcrypt"

func HashPassword(plainPassword string) (string, error) {
	HashPassword,err := bcrypt.GenerateFromPassword([]byte(plainPassword),10)
	
	if err!=nil{
		return "",err
	}
	return string(HashPassword),nil
}