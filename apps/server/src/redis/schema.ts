import { SchemaFieldTypes } from 'redis';

import { redisClient } from './redis';

export async function createRedisProductSchema() {
  const redis = await redisClient();
  try {
    // await redis.FLUSHALL();
    await redis.ft.CREATE(
      `idx:products`,
      {
        '$.id': {
          type: SchemaFieldTypes.NUMERIC,
          SORTABLE: true,
          AS: 'id',
        },
        '$.name': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: true,
          AS: 'name',
        },
        '$.description': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: true,
          AS: 'description',
        },
      },
      {
        ON: 'JSON',
        PREFIX: `product:`,
      },
    );
    return true;
  } catch (e) {
    return false;
  }
}
