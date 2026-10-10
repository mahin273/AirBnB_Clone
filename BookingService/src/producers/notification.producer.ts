import { mailerQueue } from '../queues/notification.queue.ts';
import logger from '../config/logger.ts';
import type { Booking } from '@prisma/client';

export const MAILER_JOB_NAME = 'payload:mail';

export async function sendBookingConfirmationNotification(
  booking: Booking,
  userEmail: string,
  guestName: string = 'Valued Guest'
): Promise<void> {
  const payload = {
    to: userEmail,
    subject: `Booking Confirmation - Reservation #${booking.id}`,
    templateId: 'booking-confirmation' as const,
    params: {
      guestName,
      bookingId: booking.id,
      propertyId: booking.propertyId,
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      totalGuests: booking.totalGuests,
      bookingAmount: booking.bookingAmount,
    },
  };

  try {
    await mailerQueue.add(MAILER_JOB_NAME, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: 1000,
    });
    logger.info('Booking confirmation email event enqueued', {
      bookingId: booking.id,
      to: userEmail,
    });
  } catch (error) {
    logger.error('Failed to enqueue booking confirmation email event', {
      bookingId: booking.id,
      error,
    });
  }
}

export async function sendBookingCancellationNotification(
  booking: Booking,
  userEmail: string,
  guestName: string = 'Valued Guest',
  reason: string = 'Cancelled by guest'
): Promise<void> {
  const payload = {
    to: userEmail,
    subject: `Booking Cancellation - Reservation #${booking.id}`,
    templateId: 'booking-cancellation' as const,
    params: {
      guestName,
      bookingId: booking.id,
      propertyId: booking.propertyId,
      reason,
    },
  };

  try {
    await mailerQueue.add(MAILER_JOB_NAME, payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: 1000,
    });
    logger.info('Booking cancellation email event enqueued', {
      bookingId: booking.id,
      to: userEmail,
    });
  } catch (error) {
    logger.error('Failed to enqueue booking cancellation email event', {
      bookingId: booking.id,
      error,
    });
  }
}
