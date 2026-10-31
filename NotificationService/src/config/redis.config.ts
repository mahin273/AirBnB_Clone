import { Redis, type RedisOptions } from 'ioredis';
import { serverConfig } from './index.ts';

export const redisConfig: RedisOptions = {
  port: serverConfig.REDIS_PORT,
  host: serverConfig.REDIS_HOST,
  maxRetriesPerRequest: null,
};

export const createRedisConnection = (): Redis => {
  return new Redis(redisConfig);
};

export const getRedisConnection = createRedisConnection;
