import IOrRedis from "ioredis";
import Redlock from "redlock";
import { serverConfig } from "./index.ts";

export const redisClient = new IOrRedis(serverConfig.REDIS_SERVER_URL, {
  maxRetriesPerRequest: null,
});

export const redlock = new Redlock(
  [redisClient],
  {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
  }
);
