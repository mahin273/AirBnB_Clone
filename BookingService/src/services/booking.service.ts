import type { CreateBookingDto } from '../dto/booking.dto.ts';
import {confirmBooking, createBooking, createIdempotencyKey, getIdempontentKey, finalizeIdempotencyKey} from "../repositories/booking.repository.ts";
import { BadRequestError, NotFoundError } from '../utils/errors/app.error.ts';
import { generateIdempotencyKey } from '../utils/helpers/generateIdempotencyKey.ts';
import prismaClient from '../../prisma/client.ts';
import logger from '../config/logger.ts';
export async function createBookingService(createBookingDTO:CreateBookingDto) {
  logger.info('Creating booking', { userId: createBookingDTO.userId, propertyId: createBookingDTO.propertyId });
  const booking = await createBooking({
    userId:createBookingDTO.userId,
    propertyId:createBookingDTO.propertyId,
    totalGuests:createBookingDTO.totalGuests,
    bookingAmount:createBookingDTO.bookingAmount
  });

  const idempotencyKey = generateIdempotencyKey();
  logger.info('Generated idempotency key', { bookingId: booking.id, idempotencyKey });
  await createIdempotencyKey(idempotencyKey, booking.id);

  return{
    bookingId:booking.id,
    idempotencyKey:idempotencyKey
  };
}

export async function confirmBookingService(idempotencyKey:string){
  logger.info('Starting confirm booking transaction', { idempotencyKey });
  return await prismaClient.$transaction(async(tx)=>{
 const idempotencyKeyData = await getIdempontentKey(tx,idempotencyKey);
 if(!idempotencyKeyData || !idempotencyKeyData.bookingId){
  throw new NotFoundError("Idempotency key is not found")
 }
 if(idempotencyKeyData.finalized){
  logger.warn('Attempt to reuse a finalized idempotency key', { idempotencyKey });
  throw new BadRequestError("Idempotency key is already finalized")
 }

 const booking = await confirmBooking(tx,idempotencyKeyData.bookingId);
 await finalizeIdempotencyKey(tx,idempotencyKey);
 logger.info('Booking confirmed and idempotency key finalized', { bookingId: booking.id, idempotencyKey });

 return booking;
  })

}
