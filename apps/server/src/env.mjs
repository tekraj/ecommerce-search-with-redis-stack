import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    PORT: z.string().or(z.number()).default(5000),

    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    S3_BUCKET: z.string(),
    AWS_REGION: z.string().default('us-east'),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    S3_BUCKET: process.env.S3_BUCKET,
    AWS_REGION: process.env.AWS_REGION,
  },
  emptyStringAsUndefined: true,
});
