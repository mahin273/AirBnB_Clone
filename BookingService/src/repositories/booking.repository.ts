import { Prisma } from "@prisma/client";
import PrismaClient from "../../prisma/client.ts";

export async function createBooking(bookingInput: Prisma.BookingCreateInput){
  const booking = await PrismaClient.booking.create({
    data:bookingInput
  });
  return booking;
}
