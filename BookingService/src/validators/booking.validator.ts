import { z } from "zod";

export const CreateBookingSchema = z
  .object({
    propertyId: z.number().int().positive(),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    totalGuests: z.number().int().positive(),
    bookingAmount: z.number().int().positive(),
  })
  .refine((data) => data.checkOutDate.getTime() > data.checkInDate.getTime(), {
    message: "Check-out date must be strictly after check-in date",
    path: ["checkOutDate"],
  });

export const FinalizeBookingSchema = z.object({
  idempotencyKey: z.string().uuid(),
});

export type CreateBookingSchemaInput = z.infer<typeof CreateBookingSchema>;
