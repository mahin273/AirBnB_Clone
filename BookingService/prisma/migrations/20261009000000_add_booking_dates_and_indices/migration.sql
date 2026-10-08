-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `checkInDate` DATETIME(3) NOT NULL DEFAULT '2026-01-01 00:00:00.000',
    ADD COLUMN `checkOutDate` DATETIME(3) NOT NULL DEFAULT '2026-01-02 00:00:00.000';

-- CreateIndex
CREATE INDEX `Booking_propertyId_bookingStatus_idx` ON `Booking`(`propertyId`, `bookingStatus`);

-- CreateIndex
CREATE INDEX `Booking_userId_idx` ON `Booking`(`userId`);
