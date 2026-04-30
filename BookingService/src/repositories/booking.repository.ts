import { Prisma } from "@prisma/client";
import prismaClient from "../../prisma/client.ts";

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

export async function getIdempontentKey(key:string){
  const idempotencykKey = await prismaClient.idempotencyKey.findUnique({
    where:{
      key
    }
  });
  return idempotencykKey;
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

export async function confirmBooking(bookingId:number){
  const confirmBooking = await prismaClient.booking.update({
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

export async function finalizeIdempotencyKey(key:string){
  const finalizedKey = await prismaClient.idempotencyKey.update({
    where:{
      key
    },
    data:{
      finalized: true
    }
  });
  return finalizedKey;
}
