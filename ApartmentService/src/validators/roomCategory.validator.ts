import { z } from 'zod/v3';

export const createRoomCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  roomType: z.enum(['entire_place', 'private_room', 'shared_room', 'hotel_room']),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().positive().optional(),
  beds: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  basePricePerNight: z.number().int().positive(),
});

export type CreateRoomCategoryInput = z.infer<typeof createRoomCategorySchema>;
