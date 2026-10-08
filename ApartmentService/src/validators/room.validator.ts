import { z } from 'zod/v3';

export const roomStatusEnum = z.enum(['available', 'booked', 'maintenance']);

export const createRoomSchema = z.object({
  categoryId: z.number().int().positive(),
  roomNumber: z.string().min(1).max(20),
  floor: z.number().int().optional(),
  pricePerNight: z.number().int().positive().optional(),
  status: roomStatusEnum.optional(),
});

export const updateRoomStatusSchema = z.object({
  status: roomStatusEnum,
});

export const queryRoomsSchema = z.object({
  status: roomStatusEnum.optional(),
  categoryId: z.coerce.number().int().positive().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof updateRoomStatusSchema>;
export type QueryRoomsInput = z.infer<typeof queryRoomsSchema>;
