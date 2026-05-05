import prismaClient from '../../prisma/client.ts';
import { serverConfig } from '../config/index.ts';
import logger from '../config/logger.ts';
import { redlock } from '../config/redis.config.ts';
import type { CreateBookingDto } from '../dto/booking.dto.ts';
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempontentKey } from "../repositories/booking.repository.ts";
import { BadRequestError, InternalServerError, NotFoundError } from '../utils/errors/app.error.ts';
import { generateIdempotencyKey } from '../utils/helpers/generateIdempotencyKey.ts';

export async function createBookingService(createBookingDTO:CreateBookingDto) {

  const ttl = serverConfig.LOCK_TTL;
  const bookingResource = `property:${createBookingDTO.propertyId}`;
  let lock;
  try{

    lock = await redlock.acquire([bookingResource], ttl);
     logger.info("lock value" +lock)
      // return await redlock.using([bookingResource], ttl, async () => {
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
  // });
  }catch(error){
    logger.error('Failed to acquire lock', error);
    throw new InternalServerError ('Failed to acquire lock');
  }


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
