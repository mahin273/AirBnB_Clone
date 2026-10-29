-- Create Databases
CREATE DATABASE IF NOT EXISTS airbnb_apiGateway;
CREATE DATABASE IF NOT EXISTS airbnb_apartment;
CREATE DATABASE IF NOT EXISTS airbnb_booking_dev;

-- ==========================================
-- Schema for airbnb_apiGateway
-- ==========================================
USE airbnb_apiGateway;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, 
  `name` VARCHAR(255) NOT NULL, 
  `email` VARCHAR(255) NOT NULL UNIQUE, 
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- Schema for airbnb_apartment
-- ==========================================
USE airbnb_apartment;

CREATE TABLE IF NOT EXISTS `apartments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `location` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `host_id` INT NOT NULL DEFAULT 1,
  `rating` FLOAT DEFAULT 0,
  `rating_count` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `room_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `apartment_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `room_type` ENUM('entire_place', 'private_room', 'shared_room', 'hotel_room') NOT NULL,
  `max_guests` INT NOT NULL,
  `bedrooms` INT NOT NULL DEFAULT 1,
  `beds` INT NOT NULL DEFAULT 1,
  `bathrooms` INT NOT NULL DEFAULT 1,
  `base_price_per_night` INT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  CONSTRAINT `fk_room_categories_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `apartment_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `room_number` VARCHAR(20) NOT NULL,
  `floor` INT DEFAULT NULL,
  `status` ENUM('available', 'booked', 'maintenance') DEFAULT 'available',
  `price_per_night` INT NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME DEFAULT NULL,
  CONSTRAINT `fk_rooms_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rooms_category` FOREIGN KEY (`category_id`) REFERENCES `room_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- Schema for airbnb_booking_dev
-- ==========================================
USE airbnb_booking_dev;

CREATE TABLE IF NOT EXISTS `Booking` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `propertyId` INT NOT NULL,
  `checkInDate` DATETIME(3) NOT NULL,
  `checkOutDate` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `bookingAmount` INT NOT NULL,
  `bookingStatus` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `totalGuests` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Booking_propertyId_bookingStatus_idx` (`propertyId`, `bookingStatus`),
  INDEX `Booking_userId_idx` (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `IdempotencyKey` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `key` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `finalized` BOOLEAN NOT NULL DEFAULT FALSE,
  `bookingId` INT NOT NULL,
  UNIQUE INDEX `IdempotencyKey_key_key` (`key`),
  UNIQUE INDEX `IdempotencyKey_bookingId_key` (`bookingId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `IdempotencyKey_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
