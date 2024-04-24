import { createClient } from 'redis';

import { env } from '../env.mjs';

console.log(env);
export type RedisClientType = ReturnType<typeof createClient>;
let client: RedisClientType | undefined;
export const redisClient = async (): Promise<RedisClientType> => {
  if (client) {
    return client;
  }
  const redisHost = env.REDIS_HOST;
  const redisPort = env.REDIS_PORT;
  client = createClient({
    url: `redis://localhost:6377`,
  }).on('error', (err) => {
    console.log(err);
  });
  await client.connect();
  return client;
};

export const checkIfIndexExists = async (indexName: string) => {
  const connectedClient = await redisClient();
  const indexList = await connectedClient.ft._LIST();
  return indexList.includes(indexName);
};
