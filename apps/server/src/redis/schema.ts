import { SchemaFieldTypes } from 'redis';

import { redisClient } from './redis';

export const redisProductSchema = 'products';
export async function createRedisProductSchema() {
  const redis = await redisClient();
  try {
    await redis.FLUSHALL();
    await redis.ft.CREATE(
      `idx:${redisProductSchema}`,
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
        '$.category': {
          type: SchemaFieldTypes.TEXT,
          SORTABLE: true,
          AS: 'category',
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
