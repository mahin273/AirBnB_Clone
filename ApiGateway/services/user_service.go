package services

import (
	db "ApiGateway/db/repositories"
	"ApiGateway/models"
	"ApiGateway/utils"
	"fmt"
)

type UserService interface {
	CreateUser(user *models.User) error
	GetUserByID(id int64) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
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
