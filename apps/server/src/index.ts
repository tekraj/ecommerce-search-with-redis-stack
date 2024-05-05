import cors from 'cors';
import 'dotenv/config';
import type { Application } from 'express';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createProductElasticIndex } from './elastic-search/schema';
import { syncProductsWithElasticSearch } from './elastic-search/sync-db-elastic';
import { env } from './env.mjs';
import { createRedisProductSchema } from './redis/schema';
import { syncProductsWithRedis } from './redis/sync-db-redis';
import { router } from './routes/router';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const app: Application = express();
app.use(cors());
const publicDir = path.join(dirname, '../public');
global.publicDir = publicDir;
app.use(express.static(publicDir));
const port: string | number = env.PORT;
app.use(express.json());
app.use(router);
export const bootstrap = async () => {
  // const productSchema = await createRedisProductSchema();
  // if (productSchema) {
  //   await syncProductsWithRedis();
  // }
  // const productElasticSearchSchema = await createProductElasticIndex();
  // if (productElasticSearchSchema) {
  //   await syncProductsWithElasticSearch();
  // }
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
void bootstrap();
