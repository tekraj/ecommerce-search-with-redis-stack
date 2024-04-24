import { prisma } from '@ecommerce/database';

import { redisClient } from './redis';

export const syncProductsWithRedis = async () => {
  const redis = await redisClient();
  const products = await prisma.product.findMany();
  const totalSyncedData = (
    await Promise.allSettled(
      products.map(async (product, i) => {
        return redis.json.set(`product:${product.id}`, '$', {
          name: product.name,
          description: product.description,
          id: product.id,
        });
      }),
    )
  ).filter((p) => p.status === 'fulfilled' && p.value);
  console.log(
    `Total Products = ${products.length}\n total synced=${totalSyncedData.length}`,
  );
};
