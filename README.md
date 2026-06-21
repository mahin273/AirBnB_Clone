# Airbnb Clone Microservices

This project is a lodging and travel booking platform that allows hosts to list their properties and guests to find and reserve accommodations for their trips.

## Architecture

```mermaid
graph TD
    Client[Client Browser / API Client] -->|Signup/Signin| Gateway[API Gateway :8080]
    Client -->|Manage Apartments| ApartmentSvc[Apartment Service :3000]
    Client -->|Book & Confirm| BookingSvc[Booking Service :3001]
    
    Gateway -->|MySQL| GatewayDB[(API Gateway DB)]
    ApartmentSvc -->|MySQL| ApartmentDB[(Apartment DB)]
    BookingSvc -->|MariaDB / MySQL| BookingDB[(Booking DB)]
    BookingSvc -->|Acquire/Release Locks| Redis[(Redis Server :6379)]
    
    NotificationSvc[Notification Service :3002] -->|Process Jobs| Redis
    NotificationSvc -->|Send Email| SMTP[SMTP Server]
```

## Tech Stack

* **Go**: Chosen for the API Gateway because of its high execution speed, small resource footprint, and robust concurrency primitives, which make it ideal for handling authentication and routing requests.
* **Node.js**: Serves as the server-side runtime environment for the Apartment, Booking, and Notification microservices, enabling rapid development and consistency across services.
* **Express**: Used as the web framework for the Node.js services due to its minimalist design, simplicity, and flexibility in constructing REST APIs.
* **TypeScript**: Adopted for the Node.js services to provide compile-time type safety, better tooling, and clearer contract definitions across the services.
* **Sequelize ORM**: Utilized in the Apartment Service to define data models, manage relationships, and handle database migrations for MySQL.
* **Prisma ORM**: Utilized in the Booking Service to generate a type-safe client for schema management and relational queries.
* **MySQL / MariaDB**: Used as the primary relational databases to ensure data consistency and full ACID compliance for transactions, listing availability, and user accounts.
* **Redis**: Serves as the caching and storage layer for distributed locking (Redlock) in the Booking Service and acts as the job queue backend for BullMQ in the Notification Service.
* **BullMQ**: Implemented in the Notification Service to handle reliable, asynchronous job queue processing for email delivery.
* **Nodemailer**: Used in the Notification Service to dispatch transactional emails over SMTP.
* **Zod**: Used across Node.js microservices for schema-based request validation, ensuring payload integrity at the API boundaries.
* **Winston**: Configured for structured, daily-rotating logging to ease debugging and audit operations.
* **Goose**: Implemented in the API Gateway for version-controlled database schema migrations.
* **Chi**: Used as the router for the Go API Gateway because of its speed, minimal overhead, and standard library compatibility.

## How to Run Locally

### Prerequisites

* Node.js (version 20 or higher)
* Go (version 1.26 or higher)
* Redis server (running on localhost:6379)
* MySQL database server (running on localhost:3306)

### Database Configuration

Create the three required databases in MySQL:

```sql
CREATE DATABASE airbnb_apiGateway;
CREATE DATABASE airbnb_apartment;
CREATE DATABASE airbnb_booking_dev;
```

Update the configuration variables in the `.env` files of each microservice. Ensure that distinct ports are configured to avoid local port conflicts.

#### API Gateway Config (`ApiGateway/.env`)

```env
PORT=":8080"
DB_NAME="airbnb_apiGateway"
DB_ADDR="127.0.0.1:3306"
DB_USER="YOUR_MYSQL_USER"
DB_PASSWORD="YOUR_MYSQL_PASSWORD"
DB_NET="tcp"
JWT_SECRET="YOUR_JWT_SECRET"
```

#### Apartment Service Config (`ApartmentService/.env`)

```env
PORT=3000
DB_USER=YOUR_MYSQL_USER
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=airbnb_apartment
DB_HOST=localhost
```

#### Booking Service Config (`BookingService/.env`)

```env
PORT=3001
DATABASE_URL="mysql://YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@127.0.0.1:3306/airbnb_booking_dev"
DATABASE_USER="YOUR_MYSQL_USER"
DATABASE_PASSWORD="YOUR_MYSQL_PASSWORD"
DATABASE_NAME="airbnb_booking_dev"
DATABASE_HOST="127.0.0.1"
DATABASE_PORT=3306
REDIS_SERVER_URL="redis://127.0.0.1:6379"
LOCK_TTL=60000
```

#### Notification Service Config (`NotificationService/.env`)

```env
PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=YOUR_SMTP_HOST
SMTP_PORT=587
SMTP_USER=YOUR_SMTP_USER
SMTP_PASS=YOUR_SMTP_PASS
SMTP_FROM=YOUR_SMTP_FROM
```

### Installation and Initialization

1. Install dependencies for all Node.js services:
   ```bash
   cd ApartmentService && npm install && cd ..
   cd BookingService && npm install && cd ..
   cd NotificationService && npm install && cd ..
   ```

2. Generate the Prisma Client for the Booking Service:
   ```bash
   cd BookingService
   npx prisma generate
   cd ..
   ```

3. Run migrations for the Go API Gateway:
   ```bash
   cd ApiGateway
   goose -dir=db/migrations mysql "YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@tcp(127.0.0.1:3306)/airbnb_apiGateway" up
   cd ..
   ```

4. Run migrations for the Apartment Service:
   ```bash
   cd ApartmentService
   npm run migrate
   cd ..
   ```

5. Push the database schema for the Booking Service:
   ```bash
   cd BookingService
   npx prisma db push
   cd ..
   ```

### Running the Services

Start each service in a separate terminal window or tab:

* **API Gateway**:
  ```bash
  cd ApiGateway
  go run main.go
  ```

* **Apartment Service**:
  ```bash
  cd ApartmentService
  npm run dev
  ```

* **Booking Service**:
  ```bash
  cd BookingService
  npm run dev
  ```

* **Notification Service**:
  ```bash
  cd NotificationService
  npm run dev
  ```

## Known Limitations

* **API Gateway Routing**: The API Gateway functions as a standalone identity and profile service. It does not route, proxy, or dispatch incoming traffic to downstream services like the Apartment or Booking services. Clients must target those service ports directly.
* **Port Allocation**: The default templates for the services assign multiple servers to port 3000, which causes local port conflicts unless manually reconfigured in the environment files.
* **Isolated Relational DBs**: Each service requires its own relational database scheme. Managing separate credentials, schemas, and instances locally creates administrative overhead.
* **Mock Notifications**: The Notification Service enqueues a mock test email job automatically on startup rather than reacting to dynamic bookings or user registration events from other microservices.
* **Decoupled Security**: The API Gateway issues user JWTs, but downstream APIs (Apartment and Booking services) do not yet validate these tokens in their middleware to restrict access.
* **Strict Type Compilation Error**: The Notification Service fails strict TypeScript compilation due to an unused import (`mailerQueue` inside `src/server.ts`) that is flagged by the compiler.

## What You'd Do Differently

* **Adopt an Event Broker**: Integrate a messaging broker like RabbitMQ or Apache Kafka. This would allow the Booking Service to publish events like `booking.created`, and the Notification Service to subscribe to those events asynchronously, decoupling the services completely.
* **Route Requests Through Gateway**: Configure the Go API Gateway as a true reverse proxy using paths (e.g., routing `/apartments` to `ApartmentService`). This allows central management of cross-cutting concerns like security middleware, authorization checks, and rate limiting.
* **Docker Compose Orchestration**: Author a root-level `docker-compose.yml` file to initialize Redis, MySQL, and all four service containers together, handling database startup scripts and port binding automatically.
* **Monorepo Repository Architecture**: Migrate the codebase to a monorepo setup (using Turborepo or Nx) to centralize type declarations, share validation schemas, and write unified middleware packages across services.
* **Shared Authentication Handler**: Create a reusable package for JWT verification that can be integrated as middleware across all services, ensuring authorization policies are enforced identically.
