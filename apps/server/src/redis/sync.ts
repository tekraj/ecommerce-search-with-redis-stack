import { prisma } from '@ecommerce/database';

import { redisClient } from './redis';
import { createRedisProductSchema } from './schema';

export const syncProductsWithRedis = async () => {
  const redis = await redisClient();
  await createRedisProductSchema();
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  const totalSyncedData = (
    await Promise.allSettled(
      products.map(async (product) => {
        try {
          return redis.json.set(`product:${product.id}`, '$', {
            name: product.name,
            description: product.description,
            id: product.id,
            category: product.category.name,
            tags: product.tags,
          });
        } catch (e) {
          console.log(e);
          process.exit(0);
        }
      }),
    )
  ).filter((p) => p.status === 'fulfilled' && p.value);
  console.log(
    `Total Products = ${products.length}\n total synced=${totalSyncedData.length}`,
  );
  process.exit(0);
};

void syncProductsWithRedis();
