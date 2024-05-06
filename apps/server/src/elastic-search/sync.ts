import { off } from 'node:process';

import { prisma } from '@ecommerce/database';

import { esClient, productIndexName } from './elastic';
import { createProductElasticIndex } from './schema';

export const syncProductsWithElasticSearch = async () => {
  try {
    const indexExists = await esClient.indices.exists({
      index: productIndexName,
    });
    if (indexExists) {
      await esClient.indices.delete({ index: productIndexName });
    }
    await createProductElasticIndex();

    const batchSize = 10000;
    const totalCount = await prisma.product.count();
    const offsetPositions = Array.from(
      { length: Math.ceil(totalCount / batchSize) },
      (_, index) => index * batchSize,
    );
    await Promise.allSettled(
      offsetPositions.map(async (offset) => {
        console.log(offset);
        const products = await prisma.product.findMany({
          include: { category: true },
          skip: offset,
          take: batchSize,
        });
        const bulkBody = products.flatMap((product) => [
          { index: { _index: productIndexName, _id: product.id } },
          {
            name: product.name,
            description: product.description,
            id: product.id,
            category: product.category.name,
            tags: product.tags,
          },
        ]);

        await esClient.bulk({
          refresh: true,
          body: bulkBody,
        });
      }),
    );
    process.exit(0);
  } catch (e) {
    console.log(e);
  }
};

void syncProductsWithElasticSearch();
