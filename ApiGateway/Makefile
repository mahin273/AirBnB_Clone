MIGRATIONS_FOLDER=db/migrations
DB_URL=root:10273@tcp(127.0.0.1:3306)/airbnb_apiGateway

create_migration: 
	goose -dir=$(MIGRATIONS_FOLDER) create $(name) sql

up_migration:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" up

down_migration:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" down

reset_migration:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" reset

migration_status:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" status

migrate_version:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" version

migrate_to:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" up version

migrate_down_to:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" down version

force_migration:
	goose -dir=$(MIGRATIONS_FOLDER) mysql "$(DB_URL)" force version