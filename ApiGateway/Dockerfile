# Stage 1: Build binary
FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /app/gateway .

# Stage 2: Minimal runtime
FROM alpine:3.20 AS production

WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/gateway ./gateway

EXPOSE 8080

CMD ["./gateway"]
