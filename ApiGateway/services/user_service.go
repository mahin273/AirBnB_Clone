package services

import (
	db "ApiGateway/db/repositories"
	"ApiGateway/models"
	"fmt"
)

type UserService interface {
	CreateUser(user *models.User) error
	GetUserByID(id int64) (*models.User, error)
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
	fmt.Println("Creating User in UserService")
	return u.UserRepository.Create(user)
}

func (u *UserServiceImpl) GetUserByID(id int64) (*models.User, error) {
	fmt.Println("Getting User by ID in UserService")
	return u.UserRepository.GetByID(id)
}
