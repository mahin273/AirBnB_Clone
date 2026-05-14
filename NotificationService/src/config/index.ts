import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env file before validation
dotenv.config();

/**
 * Zod schema for environment variable validation.
 * Add new env vars here — the app will fail fast at startup if they're invalid.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_HOST: z.string().default('localhost'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SMTP_USER: z.string().email(),
  SMTP_PASS: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const serverConfig = parsed.data;
