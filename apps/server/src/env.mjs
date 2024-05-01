/* eslint-disable import/no-unresolved -- fix issue */
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
  },
  runtimeEnv: {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    PORT: process.env.PORT,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL,
    ELASTIC_SEARCH_PORT: process.env.ELASTIC_SEARCH_PORT,
  },
  emptyStringAsUndefined: true,
});
