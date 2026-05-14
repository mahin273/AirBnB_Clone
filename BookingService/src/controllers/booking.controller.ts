import type{ Request,Response } from 'express';
import { createBookingService,confirmBookingService } from '../services/booking.service.ts';
import{StatusCodes} from "http-status-codes"
import logger from '../config/logger.ts';


export const createBookingController = async(req:Request,res:Response)=>{
  logger.info('Create booking request received', { body: req.body });
  const booking = await createBookingService(req.body);
  logger.info('Booking created successfully', { bookingId: booking.bookingId });
  res.status(StatusCodes.CREATED).json(booking);
}

export const confirmBookingController = async(req:Request,res:Response)=>{
  logger.info('Confirm booking request received', { idempotencyKey: req.body.idempotencyKey });
  const booking = await confirmBookingService(req.body.idempotencyKey);
  logger.info('Booking confirmed successfully', { bookingId: booking.id });
  res.status(StatusCodes.OK).json(booking);
}
