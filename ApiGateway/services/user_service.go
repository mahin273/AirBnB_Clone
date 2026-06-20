package services

import (
	env "ApiGateway/config/env"
	db "ApiGateway/db/repositories"
	"ApiGateway/models"
	"ApiGateway/utils"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type UserService interface {
	CreateUser(user *models.User) error
	GetUserByID(id int64) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	LoginUser(email, password string) (string, error)
}

type UserServiceImpl struct {
	UserRepository db.UserRepository
}

func NewUserService(_userRepository db.UserRepository) UserService {
	return &UserServiceImpl{
		UserRepository: _userRepository,
	}
}

func (u *UserServiceImpl) CreateUser(user *models.User) error {
	hashedPassword,err:=utils.HashPassword(user.Password)
	if err!=nil{
		return err
	}
	user.Password=hashedPassword
	fmt.Println("Creating User in UserService")
	return u.UserRepository.Create(user)
}

func (u *UserServiceImpl) GetUserByID(id int64) (*models.User, error) {
	fmt.Println("Getting User by ID in UserService")
	return u.UserRepository.GetByID(id)
}

func (u *UserServiceImpl) GetUserByEmail(email string) (*models.User, error) {
	fmt.Println("Getting User by Email in UserService")
	return u.UserRepository.GetByEmail(email)
}

func (u *UserServiceImpl) LoginUser(email, password string) (string, error) {
	user, err := u.UserRepository.GetByEmail(email)
	if err != nil {
		return "", err
	}

	if !utils.VerifyHashedPassword(user.Password, password) {
		return "", fmt.Errorf("invalid password")
	}

	payload := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	tokenString, err := token.SignedString([]byte(env.GetString("JWT_SECRET", "TOKEN_SECRET")))
	if err != nil {
		return "", err
	}

	fmt.Println("Generated Token:", tokenString)
	return tokenString, nil
}
