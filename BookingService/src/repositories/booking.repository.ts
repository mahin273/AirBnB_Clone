import { Prisma } from "@prisma/client";
import type { IdempotencyKey } from "@prisma/client";
import prismaClient from "../../prisma/client.ts";
import { validate as isValidUUID } from "uuid";
import { BadRequestError, NotFoundError } from '../utils/errors/app.error.ts';
import logger from '../config/logger.ts';
export async function createBooking(bookingInput: Prisma.BookingCreateInput){
  const booking = await prismaClient.booking.create({
    data:bookingInput
  });
  return booking;
}

export async function createIdempotencyKey(key:string,bookingId:number){
  const idempotencyKey = await prismaClient.idempotencyKey.create({
    data:{
      key,
      booking:{
        connect:{
          id:bookingId
        }
      }
    }
  });

  return idempotencyKey;

}

export async function getIdempontentKey(tx:Prisma.TransactionClient,key:string){
  if(!isValidUUID(key)){
    throw new BadRequestError("Invalid idempotency key")
  }
  const idempotencyKey:Array<IdempotencyKey> = await tx.$queryRaw
  `SELECT * FROM IdempotencyKey
   WHERE \`key\` = ${key} FOR UPDATE`;
   logger.info('Idempotency key fetched via raw query', { key, found: idempotencyKey.length > 0 });
   if(!idempotencyKey || idempotencyKey.length === 0){
    throw new NotFoundError("Idempotency key not found");
   }
  return idempotencyKey[0];
}

export async function getBookingById(bookingId:number){
  const booking = await prismaClient.booking.findUnique({
    where:{
      id:bookingId
    }
  });
  return booking;
}

// export async function updateBookingStatus(bookingId:number,status:Prisma.EnumBookingStatusFieldUpdateOperationsInput){
//   const confirmBooking = await prismaClient.booking.update({
//     where:{
//       id:bookingId
//     },
//     data:{
//      bookingStatus: status
//     }
//   });
//   return confirmBooking;
// }

export async function confirmBooking(tx:Prisma.TransactionClient,bookingId:number){
  const confirmBooking = await tx.booking.update({
    where:{
      id:bookingId
    },
    data:{
      bookingStatus: "CONFIRMED"
    }
  });
  return confirmBooking;
}

export async function cancelBooking(bookingId:number){
  const cancelBooking = await prismaClient.booking.update({
    where:{
      id:bookingId
    },
    data:{
      bookingStatus: "CANCELLED"
    }
  });
  return cancelBooking;
}

export async function finalizeIdempotencyKey(tx:Prisma.TransactionClient,key:string){
  const finalizedKey = await tx.idempotencyKey.update({
    where:{
      key
    },
    data:{
      finalized: true
    }
  });
  return finalizedKey;
}
