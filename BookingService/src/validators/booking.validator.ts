import { z } from "zod";

export const CreateBookingSchema = z.object({

    userId: z.number().int().positive().min(1),
    propertyId: z.number().int().positive().min(1),
    totalGuests: z.number().int().positive().min(1),
    bookingAmount: z.number().int().positive().min(1)

})

export const FinalizeBookingSchema = z.object({

    idempotencyKey: z.string().uuid()

})
