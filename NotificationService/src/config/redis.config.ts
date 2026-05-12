import { Redis } from 'ioredis';
import logger from './logger.config.ts';
import { serverConfig } from './index.ts';

function connectToRedis() {
  try {
    let connection: Redis;
    const redisConfig = {
      port: serverConfig.REDIS_PORT,
      host: serverConfig.REDIS_HOST,
      maxRetriesPerRequest: null,
    }
    return () => {
      if (!connection) {
        connection = new Redis(redisConfig);
        return connection;
      }
      return connection;
    };
  } catch (error) {
    logger.error('Redis connection failed', error);
    throw error;

  }
}

export const getRedisConnection = connectToRedis();
