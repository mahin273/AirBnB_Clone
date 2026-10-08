import type { Request, Response, NextFunction } from 'express';
import { createBookingService, confirmBookingService } from '../services/booking.service.ts';
import { StatusCodes } from 'http-status-codes';
import logger from '../config/logger.ts';

export const createBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    logger.info('Create booking request received', { userId, body: req.body });
    const booking = await createBookingService({
      ...req.body,
      userId,
    });
    logger.info('Booking created successfully', { bookingId: booking.bookingId });
    res.status(StatusCodes.CREATED).json(booking);
  } catch (error) {
    next(error);
  }
};

export const confirmBookingController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Confirm booking request received', { idempotencyKey: req.body.idempotencyKey });
    const booking = await confirmBookingService(req.body.idempotencyKey);
    logger.info('Booking confirmed successfully', { bookingId: booking.id });
    res.status(StatusCodes.OK).json(booking);
  } catch (error) {
    next(error);
  }
};
