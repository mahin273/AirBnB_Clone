package db

import (
	"ApiGateway/models"
	"database/sql"
	"fmt"
)

type UserRepository interface {
	Create(user *models.User) error
	GetByID(id int64) (*models.User, error)
}

type UserRepositoryImpl struct {
	db *sql.DB
}



func NewUserRepository(_db *sql.DB) UserRepository{
	return &UserRepositoryImpl{
		db:_db,
	}
}

func (u *UserRepositoryImpl) Create(user *models.User) error {
	query := `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`
	
	result, err := u.db.Exec(query, user.Name, user.Email, user.Password)
	if err != nil {
		fmt.Println("Error inserting user:", err)
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	user.ID = id
	return nil
}

func (u *UserRepositoryImpl) GetByID(id int64) (*models.User, error) {
	query := `SELECT id, name, email, password, created_at, updated_at FROM users WHERE id = ?`
	row := u.db.QueryRow(query, id)

	user := &models.User{}
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}

	return user, nil
}