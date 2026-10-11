# BookingService Microservice

The high-concurrency reservation and booking lifecycle engine of the Airbnb Clone platform. Built with Express 5, TypeScript (strict mode), and Prisma ORM on MariaDB/MySQL, this microservice coordinates stay interval validations, distributed mutual exclusion (Redlock), idempotent transaction finalization, and asynchronous notification event publishing via BullMQ.

---

## Architectural Flow

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Client / Guest
    participant Router as booking.router.ts
    participant Svc as booking.service.ts
    participant Redlock as Redis Redlock
    participant DB as MariaDB / Prisma
    participant Queue as Redis (queue-mailer)

    Guest->>Router: POST /api/v1/bookings (propertyId, dates)
    Router->>Svc: createBookingService()
    Svc->>Redlock: Acquire distributed lock property:id
    Redlock-->>Svc: Lock acquired
    
    rect rgb(240, 248, 255)
        Note over Svc,DB: Critical Section
        Svc->>DB: findOverlappingBookings()
        DB-->>Svc: Overlaps = 0
        Svc->>DB: INSERT Booking (PENDING) + IdempotencyKey
        DB-->>Svc: Created
    end
    
    Svc->>Redlock: Release distributed lock (finally block)
    Svc-->>Guest: 201 Created (idempotencyKey)

    Guest->>Router: POST /api/v1/bookings/confirm (idempotencyKey)
    Router->>Svc: confirmBookingService()
    Svc->>DB: $transaction: UPDATE Booking CONFIRMED, finalize key
    DB-->>Svc: Transaction committed
    
    rect rgb(230, 245, 230)
        Note over Svc,Queue: Asynchronous Event Dispatch
        Svc->>Queue: queue.add('payload:mail', booking-confirmation)
    end
    
    Svc-->>Guest: 200 OK (Booking Confirmed)
```

---

## Core Engineering Patterns

### 1. Distributed Locking with Redlock (`src/services/booking.service.ts`)
- **Resource Locking**: To prevent concurrent race conditions, requests acquire an exclusive lock on `property:<propertyId>` with a configurable TTL (`LOCK_TTL`).
- **Guaranteed Release (`try...finally`)**: All lock releases run inside a `finally` block to prevent socket deadlocks or orphaned locks if queries throw exceptions.
- **Semantic Conflict Mapping**: When lock acquisition times out due to high contention, the service throws `ConflictError` mapping to HTTP `409 Conflict`.

### 2. Zero Double-Booking Collision Queries (`src/repositories/booking.repository.ts`)
Inside the locked critical section, the repository executes `findOverlappingBookings` checking interval intersections:
```prisma
where: {
  propertyId,
  bookingStatus: { in: ['CONFIRMED', 'PENDING'] },
  checkInDate: { lt: requestedCheckOut },
  checkOutDate: { gt: requestedCheckIn }
}
```

### 3. Idempotent Confirmation Lifecycle (`src/services/booking.service.ts`)
- Prevents double-charging or repeated confirmation through `IdempotencyKey`.
- Handled atomically inside Prisma's `$transaction(async (tx) => { ... })`:
  1. Checks if idempotency key exists and is unfinalized.
  2. Updates booking status to `CONFIRMED`.
  3. Marks `finalized: true` on the idempotency key record.

### 4. Asynchronous Event Producer (`src/producers/notification.producer.ts`)
- Once the database transaction commits, the service dispatches event jobs to the Redis queue `queue-mailer`:
  - `sendBookingConfirmationNotification`: Triggered when reservation is confirmed.
  - `sendBookingCancellationNotification`: Triggered when reservation is cancelled.
- Configured with exponential retry backoff (`attempts: 3`, delay: 2000ms).
- Wrapped in resilient error boundaries so email publishing errors never abort confirmed database transactions.

---

## API Catalog

| Method | Endpoint | Access | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/bookings` | Guest | Initiate booking, acquire Redlock, create PENDING booking |
| `POST` | `/api/v1/bookings/confirm` | Guest | Finalize idempotency key, confirm reservation, emit confirmation event |
| `GET` | `/api/v1/bookings/my-bookings` | Guest | Retrieve historical bookings for authenticated user |
| `GET` | `/api/v1/bookings/:id` | Guest | Lookup specific booking details (IDOR ownership protected) |
| `POST` | `/api/v1/bookings/:id/cancel` | Guest | Atomically cancel reservation and emit cancellation event |

---

## Prisma Schema

```prisma
model Booking {
  id             Int           @id @default(autoincrement())
  userId         Int
  propertyId     Int
  checkInDate    DateTime
  checkOutDate   DateTime
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  bookingAmount  Int
  bookingStatus  BookingStatus @default(PENDING)
  totalGuests    Int
  idempotencyKey IdempotencyKey?

  @@index([propertyId, bookingStatus])
  @@index([userId])
}

model IdempotencyKey {
  id         Int       @id @default(autoincrement())
  key        String    @unique
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  finalized  Boolean   @default(false)
  bookingId  Int       @unique
  booking    Booking?  @relation(fields: [bookingId], references: [id])
}
```

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `PORT` | `3001` | Service HTTP listen port |
| `DATABASE_URL` | `mysql://root:root@localhost:3306/airbnb_booking_dev` | Prisma database connection string |
| `REDIS_SERVER_URL` | `redis://localhost:6379` | Redis connection URL for Redlock and BullMQ |
| `LOCK_TTL` | `10000` | Redlock distributed lock time-to-live in milliseconds |

---

## Development & Verification

### Generate Prisma Client
```bash
npx prisma generate
```

### Push Database Schema
```bash
npx prisma db push
```

### Strict TypeScript Typecheck
```bash
./node_modules/.bin/tsc --noEmit
```

### Start Development Server
```bash
npm run dev
```
