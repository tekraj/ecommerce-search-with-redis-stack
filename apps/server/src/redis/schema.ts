import { SchemaFieldTypes } from 'redis';

import { redisClient } from './redis';

export async function createRedisProductSchema() {
  const redis = await redisClient();
  try {
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
    const error = e as { message: string } | undefined;
    if (error?.message === 'Index already exists') {
      return true;
    }
    return false;
  }
}
