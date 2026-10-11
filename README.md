# Airbnb Clone Microservices Platform

An enterprise-grade, distributed lodging and hospitality reservation platform engineered as event-driven microservices. Built with Go, Node.js, TypeScript, MariaDB/MySQL, Redis, Prisma, and Sequelize, this platform demonstrates production-ready patterns for distributed mutual exclusion, idempotent transactions, asynchronous event streaming, and edge API gateway routing.

---

## Architecture Overview

```mermaid
flowchart TD
    Client[Client / Web / Mobile App] -->|HTTP / HTTPS :8080| Gateway[ApiGateway :8080 - Go / Chi]

    subgraph EdgePerimeter [API Gateway Security & Routing Perimeter]
        Gateway --> RateLimiter[RateLimiter: 60 req/min, 10 burst]
        RateLimiter --> ChiRouter[Chi Radix Trie Router]
        ChiRouter -->|Auth: /signup, /signin| UserDB[(MySQL: airbnb_apiGateway)]
        ChiRouter -->|Public: GET /apartments| ProxyEngine[Reverse Proxy Engine]
        ChiRouter -->|Protected: POST, PUT, DELETE| AuthMW[RequireAuth: JWT Verification]
        AuthMW -->|Cleanses Spoofed Headers & Injects Context| ProxyEngine
    end

    subgraph ServiceMesh [Domain Microservices]
        ProxyEngine -->|Forward /api/v1/apartments| AptSvc[ApartmentService :3000 - Express / Sequelize]
        ProxyEngine -->|Forward /api/v1/bookings| BookSvc[BookingService :3001 - Express / Prisma]
        
        AptSvc --> AptDB[(MySQL: airbnb_apartment)]
        BookSvc --> BookDB[(MariaDB / MySQL: airbnb_booking_dev)]
    end

    subgraph AsyncBackbone [Concurrency & Event Messaging Backbone]
        BookSvc <-->|Redlock Distributed Mutex| RedisLocks[(Redis :6379 Locks)]
        BookSvc -->|Publish payload:mail| RedisQueue[(Redis :6379 queue-mailer)]
        
        RedisQueue -->|Consume & Validate Zod Schema| NotifWorker[NotificationService :3002 - BullMQ Worker]
        NotifWorker --> TemplateEngine[Handlebars Template Compiler]
        TemplateEngine --> SMTP[External SMTP / Mailer]
    end
```

---

## Microservices Breakdown

### 1. ApiGateway (Port 8080)
- **Language & Framework**: Go 1.23+, Chi router.
- **Responsibilities**:
  - Edge security perimeter enforcing client IP rate limiting (60 requests/minute, 10 burst).
  - User identity authentication (JWT Bearer tokens), user registration, and credential hashing with bcrypt.
  - Reverse proxy engine with Go 1.20+ `httputil.ProxyRequest` and `Rewrite` hooks.
  - Zero-trust header cleansing: strips client-supplied `X-User-ID` and `X-User-Email` headers to prevent identity spoofing, and injects verified identity from JWT context.
  - Connection pooling with dedicated `http.Transport` (100 idle connections, 90s idle timeout, 15s header timeout).
  - Standardized JSON `502 Bad Gateway` error handling when downstream services are unreachable.

### 2. ApartmentService (Port 3000)
- **Language & Framework**: Node.js 22, Express 5, TypeScript (strict mode), Sequelize ORM.
- **Responsibilities**:
  - Apartment listing lifecycle: create, browse, view details, and soft delete.
  - Host ownership enforcement: verifies requesting host owns the listing before allowing modifications.
  - Room Category management: sub-resource routing using `express.Router({ mergeParams: true })` for pricing, guest capacity, and room types.
  - Concrete Room inventory tracking: manages room availability state transitions (`available`, `booked`, `maintenance`).
  - Cross-entity integrity defense: validates that category IDs belong strictly to the target apartment before assigning physical rooms.

### 3. BookingService (Port 3001)
- **Language & Framework**: Node.js 22, Express 5, TypeScript (strict mode), Prisma ORM, Redlock, BullMQ.
- **Responsibilities**:
  - Stay interval management: strictly validates that `checkOutDate > checkInDate` and enforces composite indices (`[propertyId, bookingStatus]`).
  - Distributed Concurrency Control: acquires distributed locks via Redlock on `property:<id>` before evaluating room availability.
  - Zero Double-Booking Guarantee: executes atomic interval collision checks (`findOverlappingBookings`) inside the critical section.
  - Lifecycle hardening: guarantees lock release via `try...finally` blocks and returns semantic `409 Conflict` on lock contention.
  - Idempotent finalization: uses `IdempotencyKey` records within Prisma `$transaction` blocks to prevent duplicate charges or double confirmations.
  - Booking cancellation: atomic state transitions with IDOR checks and start-date boundary defenses.
  - Asynchronous event emission: pushes typed confirmation and cancellation jobs to Redis `queue-mailer` post-transaction.

### 4. NotificationService (Port 3002)
- **Language & Framework**: Node.js 22, Express 5, TypeScript (strict mode), BullMQ, Handlebars, Nodemailer.
- **Responsibilities**:
  - Asynchronous email queue worker processing jobs from `queue-mailer`.
  - Schema contract validation: validates inbound job payloads against strict Zod discriminated union schemas (`NotificationPayload`).
  - Template rendering: compiles Handlebars templates (`booking-confirmation.hbs`, `booking-cancellation.hbs`) with dynamic variables.
  - Resilient dispatch: configures exponential backoff retries (`attempts: 3`, initial delay 2000ms) with dead-letter queue isolation.

---

## Core Engineering Patterns

### 1. Database-per-Service Architecture
Each microservice owns its private relational schema:
- `airbnb_apiGateway`: Users, credentials, timestamps.
- `airbnb_apartment`: Apartments, room categories, physical room inventories.
- `airbnb_booking_dev`: Bookings, stay dates, idempotency keys.

Services never perform cross-database queries or foreign keys across service boundaries. Cross-service data is correlated via verified identifiers forwarded through HTTP headers and message payloads.

### 2. Zero-Trust Gateway Header Cleansing
Downstream services trust `X-User-ID` and `X-User-Email` headers because they reside within the private network. To prevent external clients from injecting arbitrary user IDs:
```go
// ApiGateway/utils/proxy.go
r.Out.Header.Del("X-User-ID")
r.Out.Header.Del("X-User-Email")

if userID, ok := GetUserIDFromContext(r.In.Context()); ok {
    r.Out.Header.Set("X-User-ID", fmt.Sprintf("%d", userID))
}
```

### 3. Distributed Mutual Exclusion (Redlock)
To protect high-demand listings from concurrent booking collisions:
```typescript
const lock = await redlock.acquire([bookingResource], ttl);
try {
  const overlapping = await findOverlappingBookings(propertyId, checkIn, checkOut);
  if (overlapping.length > 0) throw new ConflictError('Selected dates already booked');
  return await createBooking(...);
} finally {
  await lock.release();
}
```

### 4. Transaction-First Side-Effect Execution
External side-effects (message queue pushes) run strictly **after** database transactions commit. If the database transaction rolls back, no message is enqueued. If Redis fails, the error is logged and swallowed so it does not abort a legally confirmed reservation.

---

## API Reference Matrix

| Method | Public Gateway Endpoint | Downstream Target | Auth Required | Description |
| :--- | :--- | :--- | :---: | :--- |
| `POST` | `/signup` | Local ApiGateway | No | Register new user account |
| `POST` | `/signin` | Local ApiGateway | No | Authenticate user and receive JWT token |
| `GET` | `/users/profile` | Local ApiGateway | Yes | Retrieve authenticated user profile |
| `GET` | `/api/v1/apartments` | ApartmentService | No | Browse published apartment listings |
| `GET` | `/api/v1/apartments/:id` | ApartmentService | No | Retrieve detailed apartment listing |
| `POST` | `/api/v1/apartments` | ApartmentService | Yes (Host) | Create new apartment listing |
| `DELETE` | `/api/v1/apartments/:id` | ApartmentService | Yes (Host) | Soft-delete owned apartment listing |
| `GET` | `/api/v1/apartments/:id/categories` | ApartmentService | No | List room tiers for an apartment |
| `POST` | `/api/v1/apartments/:id/categories` | ApartmentService | Yes (Host) | Create room tier (pricing, guests) |
| `POST` | `/api/v1/categories/:id/rooms` | ApartmentService | Yes (Host) | Add physical room inventory |
| `PUT` | `/api/v1/rooms/:id/status` | ApartmentService | Yes (Host) | Transition room status (`available`/`booked`/`maintenance`) |
| `POST` | `/api/v1/bookings` | BookingService | Yes (Guest) | Initiate reservation (acquires Redlock) |
| `POST` | `/api/v1/bookings/confirm` | BookingService | Yes (Guest) | Finalize idempotency key and confirm booking |
| `GET` | `/api/v1/bookings/my-bookings` | BookingService | Yes (Guest) | Retrieve reservation history for authenticated user |
| `GET` | `/api/v1/bookings/:id` | BookingService | Yes (Guest) | Retrieve specific reservation details (IDOR protected) |
| `POST` | `/api/v1/bookings/:id/cancel` | BookingService | Yes (Guest) | Cancel active reservation (emits cancellation event) |

---

## Quickstart: Docker Compose Orchestration

The entire multi-service platform, including databases and message queues, boots with a single command.

### Prerequisites
- Docker Engine 24.x or higher
- Docker Compose v2

### One-Command Boot
```bash
docker compose up -d --build
```

### Healthcheck & Container Status
```bash
docker compose ps
```

All 6 containers will spin up on the unified bridge network `airbnb-network`:
- `airbnb-mysql` (:3306) - Initialized with all 3 schemas via `docker/init.sql`.
- `airbnb-redis` (:6379) - In-memory cache for distributed locks and BullMQ queues.
- `airbnb-api-gateway` (:8080) - Edge routing and authentication.
- `airbnb-apartment-service` (:3000) - Inventory catalog.
- `airbnb-booking-service` (:3001) - Reservation engine.
- `airbnb-notification-service` (:3002) - Email worker.

To view logs:
```bash
docker compose logs -f
```

To stop containers:
```bash
docker compose down -v
```

---

## Local Development (Without Docker)

### Prerequisites
- Go 1.23+
- Node.js 22+
- MySQL 8.x running on `localhost:3306`
- Redis 7.x running on `localhost:6379`

### 1. Database Initialization
Execute in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS airbnb_apiGateway;
CREATE DATABASE IF NOT EXISTS airbnb_apartment;
CREATE DATABASE IF NOT EXISTS airbnb_booking_dev;
```

### 2. Service Setup & Migrations

```bash
# ApiGateway
cd ApiGateway
go mod download
go test ./...
go run main.go

# ApartmentService
cd ../ApartmentService
npm install
npm run migrate
npm run dev

# BookingService
cd ../BookingService
npm install
npx prisma db push
npm run dev

# NotificationService
cd ../NotificationService
npm install
npm run build
npm run dev
```

---

## Configuration Reference

### ApiGateway (`ApiGateway/.env`)
```env
PORT=:8080
DB_NAME=airbnb_apiGateway
DB_ADDR=127.0.0.1:3306
DB_USER=root
DB_PASSWORD=root
DB_NET=tcp
JWT_SECRET=super_secret_jwt_key_airbnb_2026
APARTMENT_SERVICE_URL=http://localhost:3000
BOOKING_SERVICE_URL=http://localhost:3001
```

### ApartmentService (`ApartmentService/.env`)
```env
PORT=3000
DB_USER=root
DB_PASSWORD=root
DB_NAME=airbnb_apartment
DB_HOST=127.0.0.1
```

### BookingService (`BookingService/.env`)
```env
PORT=3001
DATABASE_URL=mysql://root:root@127.0.0.1:3306/airbnb_booking_dev
DATABASE_USER=root
DATABASE_PASSWORD=root
DATABASE_NAME=airbnb_booking_dev
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
REDIS_SERVER_URL=redis://127.0.0.1:6379
LOCK_TTL=60000
```

### NotificationService (`NotificationService/.env`)
```env
PORT=3002
REDIS_HOST=localhost
REDIS_PORT=6379
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@airbnb-clone.local
```

---

## Verification & Testing

Run all test suites across the entire repository:

```bash
# Go API Gateway Unit & Router Integration Tests
cd ApiGateway && go test -v ./... && cd ..

# ApartmentService TypeScript Compilation
cd ApartmentService && ./node_modules/.bin/tsc --noEmit && cd ..

# BookingService TypeScript Compilation
cd BookingService && ./node_modules/.bin/tsc --noEmit && cd ..

# NotificationService Build & Asset Bundling
cd NotificationService && npm run build && cd ..
```
