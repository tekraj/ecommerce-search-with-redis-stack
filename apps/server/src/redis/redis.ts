import { createClient } from 'redis';

import { env } from '../env.mjs';

export type RedisClientType = ReturnType<typeof createClient>;
let client: RedisClientType | undefined;
export const redisClient = async (): Promise<RedisClientType> => {
  if (client) {
    return client;
  }
  const redisHost = env.REDIS_URL;
  const redisPort = env.REDIS_PORT;
  client = await createClient({
    url: `redis://${redisHost}:${redisPort}`,
    password: env.REDIS_PASSWORD,
  })
    .on('error', (err) => {
      console.log(err);
    })
    .connect();
  return client;
};
