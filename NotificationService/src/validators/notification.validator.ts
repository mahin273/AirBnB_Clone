import { z } from 'zod';

export const welcomeParamsSchema = z.object({
  name: z.string().min(1),
  appName: z.string().min(1),
});

export const bookingConfirmationParamsSchema = z.object({
  guestName: z.string().min(1),
  bookingId: z.union([z.number(), z.string()]),
  propertyId: z.union([z.number(), z.string()]),
  checkInDate: z.string().min(1),
  checkOutDate: z.string().min(1),
  totalGuests: z.number().int().positive(),
  bookingAmount: z.number().positive(),
});

export const bookingCancellationParamsSchema = z.object({
  guestName: z.string().min(1),
  bookingId: z.union([z.number(), z.string()]),
  propertyId: z.union([z.number(), z.string()]),
  reason: z.string().optional(),
});

export const welcomePayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  templateId: z.literal('welcome'),
  params: welcomeParamsSchema,
});

export const bookingConfirmationPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  templateId: z.literal('booking-confirmation'),
  params: bookingConfirmationParamsSchema,
});

export const bookingCancellationPayloadSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  templateId: z.literal('booking-cancellation'),
  params: bookingCancellationParamsSchema,
});

export const notificationPayloadSchema = z.discriminatedUnion('templateId', [
  welcomePayloadSchema,
  bookingConfirmationPayloadSchema,
  bookingCancellationPayloadSchema,
]);

export type NotificationPayload = z.infer<typeof notificationPayloadSchema>;
