import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    REDIS_URL: z.string().default('localhost'),
    REDIS_PORT: z.string().or(z.number()).default(6379),
    REDIS_PASSWORD: z.string().default('ecommerce'),
    PORT: z.string().or(z.number()).default(5000),
    ELASTIC_SEARCH_URL: z.string().default('ecommerce-elasticsearch'),
    ELASTIC_SEARCH_PORT: z.string().or(z.number()).default(9300),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    S3_BUCKET: z.string(),
    AWS_REGION: z.string().default('us-east'),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
  },
  runtimeEnv: {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    PORT: process.env.PORT,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL,
    ELASTIC_SEARCH_PORT: process.env.ELASTIC_SEARCH_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    S3_BUCKET: process.env.S3_BUCKET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  },
  emptyStringAsUndefined: true,
});
