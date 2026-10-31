import prismaClient from '../../prisma/client.ts';
import { serverConfig } from '../config/index.ts';
import logger from '../config/logger.ts';
import { redlock } from '../config/redis.config.ts';
import type { Lock } from 'redlock';
import type { CreateBookingDto } from '../dto/booking.dto.ts';
import {
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
import {
  sendBookingConfirmationNotification,
  sendBookingCancellationNotification,
} from '../producers/notification.producer.ts';

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

export async function confirmBookingService(
  idempotencyKey: string,
  requestingUserId: number,
  userEmail?: string
) {
  logger.info('Starting confirm booking transaction', { idempotencyKey, requestingUserId });
  const { booking, isNewConfirmation } = await prismaClient.$transaction(async (tx) => {
    const idempotencyKeyData = await getIdempontentKey(tx, idempotencyKey);
    if (!idempotencyKeyData || !idempotencyKeyData.bookingId) {
      throw new NotFoundError("Idempotency key is not found");
    }

    const currentBooking = await tx.booking.findUnique({
      where: { id: idempotencyKeyData.bookingId },
    });

    if (!currentBooking) {
      throw new NotFoundError(`Booking with id ${idempotencyKeyData.bookingId} not found`);
    }

    if (currentBooking.userId !== requestingUserId) {
      throw new ForbiddenError('You do not have permission to confirm this booking');
    }

    // Idempotent retry: If already finalized, return the confirmed booking without re-confirming
    if (idempotencyKeyData.finalized) {
      logger.info('Attempt to reuse a finalized idempotency key, returning confirmed booking', { idempotencyKey });
      return { booking: currentBooking, isNewConfirmation: false };
    }

    if (currentBooking.bookingStatus === 'CANCELLED') {
      throw new BadRequestError('Cannot confirm a cancelled booking');
    }

    if (currentBooking.bookingStatus !== 'PENDING') {
      throw new BadRequestError(`Cannot confirm booking in ${currentBooking.bookingStatus} status`);
    }

    if (new Date() >= currentBooking.checkInDate) {
      throw new BadRequestError('Cannot confirm a booking that has already started or passed');
    }

    const isExpired = Date.now() - new Date(currentBooking.createdAt).getTime() > 15 * 60 * 1000;
    if (isExpired) {
      await tx.booking.update({
        where: { id: currentBooking.id },
        data: { bookingStatus: 'CANCELLED' },
      });
      throw new BadRequestError('Booking reservation has expired. Please initiate a new booking.');
    }

    const confirmed = await confirmBooking(tx, idempotencyKeyData.bookingId);
    await finalizeIdempotencyKey(tx, idempotencyKey);
    logger.info('Booking confirmed and idempotency key finalized', {
      bookingId: confirmed.id,
      idempotencyKey,
    });

    return { booking: confirmed, isNewConfirmation: true };
  });

  if (isNewConfirmation) {
    await sendBookingConfirmationNotification(
      booking,
      userEmail || `user_${booking.userId}@example.com`
    );
  }

  return booking;
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

export async function cancelBookingService(
  bookingId: number,
  requestingUserId: number,
  userEmail?: string
) {
  logger.info('Attempting to cancel booking', { bookingId, requestingUserId });

  const cancelled = await prismaClient.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

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

    return await tx.booking.update({
      where: { id: bookingId },
      data: {
        bookingStatus: 'CANCELLED',
      },
    });
  });

  logger.info('Booking cancelled successfully', { bookingId });

  await sendBookingCancellationNotification(
    cancelled,
    userEmail || `user_${cancelled.userId}@example.com`
  );

  return cancelled;
}
