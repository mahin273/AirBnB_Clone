import prismaClient from '../../prisma/client.ts';
import { serverConfig } from '../config/index.ts';
import logger from '../config/logger.ts';
import { redlock } from '../config/redis.config.ts';
import type { Lock } from 'redlock';
import type { CreateBookingDto } from '../dto/booking.dto.ts';
import {
  cancelBooking,
  confirmBooking,
  createBooking,
  createIdempotencyKey,
  finalizeIdempotencyKey,
  findOverlappingBookings,
  getBookingById,
  getBookingsByUserId,
  getIdempontentKey,
} from "../repositories/booking.repository.ts";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../utils/errors/app.error.ts';
import { generateIdempotencyKey } from '../utils/helpers/generateIdempotencyKey.ts';

export async function createBookingService(createBookingDTO: CreateBookingDto) {
  const ttl = serverConfig.LOCK_TTL;
  const bookingResource = `property:${createBookingDTO.propertyId}`;
  let lock: Lock;

  try {
    lock = await redlock.acquire([bookingResource], ttl);
    logger.info(`Acquired distributed lock for resource ${bookingResource}`);
  } catch (error) {
    logger.warn('Failed to acquire distributed lock for resource', {
      resource: bookingResource,
      error,
    });
    throw new ConflictError(
      'The property is currently being booked by another user. Please try again.'
    );
  }

  try {
    logger.info('Checking overlapping bookings', {
      propertyId: createBookingDTO.propertyId,
      checkInDate: createBookingDTO.checkInDate,
      checkOutDate: createBookingDTO.checkOutDate,
    });

    const overlapping = await findOverlappingBookings(
      createBookingDTO.propertyId,
      createBookingDTO.checkInDate,
      createBookingDTO.checkOutDate
    );

    if (overlapping.length > 0) {
      throw new ConflictError(
        'Property is already booked for the selected date range'
      );
    }

    logger.info('Creating booking', {
      userId: createBookingDTO.userId,
      propertyId: createBookingDTO.propertyId,
    });

    const booking = await createBooking({
      userId: createBookingDTO.userId,
      propertyId: createBookingDTO.propertyId,
      checkInDate: createBookingDTO.checkInDate,
      checkOutDate: createBookingDTO.checkOutDate,
      totalGuests: createBookingDTO.totalGuests,
      bookingAmount: createBookingDTO.bookingAmount,
    });

    const idempotencyKey = generateIdempotencyKey();
    logger.info('Generated idempotency key', {
      bookingId: booking.id,
      idempotencyKey,
    });
    await createIdempotencyKey(idempotencyKey, booking.id);

    return {
      bookingId: booking.id,
      idempotencyKey,
    };
  } finally {
    try {
      await lock.release();
      logger.info('Successfully released distributed lock', {
        resource: bookingResource,
      });
    } catch (releaseError) {
      logger.error('Failed to release distributed lock', {
        resource: bookingResource,
        releaseError,
      });
    }
  }
}

export async function confirmBookingService(idempotencyKey: string) {
  logger.info('Starting confirm booking transaction', { idempotencyKey });
  return await prismaClient.$transaction(async (tx) => {
    const idempotencyKeyData = await getIdempontentKey(tx, idempotencyKey);
    if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
      throw new NotFoundError("Idempotency key is not found");
    }
    if (idempotencyKeyData.finalized) {
      logger.warn('Attempt to reuse a finalized idempotency key', { idempotencyKey });
      throw new BadRequestError("Idempotency key is already finalized");
    }

    const booking = await confirmBooking(tx, idempotencyKeyData.bookingId);
    await finalizeIdempotencyKey(tx, idempotencyKey);
    logger.info('Booking confirmed and idempotency key finalized', {
      bookingId: booking.id,
      idempotencyKey,
    });

    return booking;
  });
}

export async function getMyBookingsService(userId: number) {
  logger.info('Fetching bookings for user', { userId });
  return await getBookingsByUserId(userId);
}

export async function getBookingByIdService(bookingId: number, requestingUserId: number) {
  logger.info('Fetching booking by id', { bookingId, requestingUserId });
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with id ${bookingId} not found`);
  }
  if (booking.userId !== requestingUserId) {
    throw new ForbiddenError('You do not have permission to view this booking');
  }
  return booking;
}

export async function cancelBookingService(bookingId: number, requestingUserId: number) {
  logger.info('Attempting to cancel booking', { bookingId, requestingUserId });
  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new NotFoundError(`Booking with id ${bookingId} not found`);
  }
  if (booking.userId !== requestingUserId) {
    throw new ForbiddenError('You do not have permission to cancel this booking');
  }
  if (booking.bookingStatus === 'CANCELLED') {
    throw new BadRequestError('Booking is already cancelled');
  }
  if (new Date() >= booking.checkInDate) {
    throw new BadRequestError('Cannot cancel a booking that has already started or passed');
  }

  const cancelled = await cancelBooking(bookingId);
  logger.info('Booking cancelled successfully', { bookingId });
  return cancelled;
}
