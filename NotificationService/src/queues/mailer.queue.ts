import { Queue } from 'bullmq';
import { getRedisConnection } from '../config/redis.config.ts';

export const MAILER_QUEUE = 'queue-mailer';

export const mailerQueue = new Queue(MAILER_QUEUE,{
  connection:getRedisConnection(),
});
