import type { CreateBookingDto } from '../dto/booking.dto.ts';
import {confirmBooking, createBooking, createIdempotencyKey, getIdempontentKey, finalizeIdempotencyKey} from "../repositories/booking.repository.ts";
import { BadRequestError, NotFoundError } from '../utils/errors/app.error.ts';
import { generateIdempotencyKey } from '../utils/helpers/generateIdempotencyKey.ts';

export async function createBookingService(createBookingDTO:CreateBookingDto) {
  const booking = await createBooking({
    userId:createBookingDTO.userId,
    propertyId:createBookingDTO.propertyId,
    totalGuests:createBookingDTO.totalGuests,
    bookingAmount:createBookingDTO.bookingAmount
  });

  const idempotencyKey = generateIdempotencyKey();
  await createIdempotencyKey(idempotencyKey, booking.id);

  return{
    bookingId:booking.id,
    idempotencyKey:idempotencyKey
  };
}

export async function confirmBookingService(idempotencyKey:string){
 const idempotencyKeyData = await getIdempontentKey(idempotencyKey);
 if(!idempotencyKeyData){
  throw new NotFoundError("Idempotency key is not found")
 }
 if(idempotencyKeyData.finalized){
  throw new BadRequestError("Idempotency key is already finalized")
 }

 const booking = await confirmBooking(idempotencyKeyData.bookingId)
 await finalizeIdempotencyKey(idempotencyKey);

 return booking;
}
