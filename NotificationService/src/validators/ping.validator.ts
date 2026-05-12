import { z } from 'zod/v3';

export const pingParamsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});
