import type{ Request,Response } from 'express';
import { createBookingService,confirmBookingService } from '../services/booking.service.ts';
import{StatusCodes} from "http-status-codes"


export const createBookingController = async(req:Request,res:Response)=>{

  const booking = await createBookingService(req.body);
  res.status(StatusCodes.CREATED).json(booking);
}

export const confirmBookingController = async(req:Request,res:Response)=>{

  const booking = await confirmBookingService(req.body.idempotencyKey);
  res.status(StatusCodes.OK).json(booking);
}
