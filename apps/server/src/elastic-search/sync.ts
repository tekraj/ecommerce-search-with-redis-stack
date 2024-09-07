import { prisma } from '@ecommerce/database';

import { esClient, productIndexName, productTagIndexName } from './elastic';
import { createProductTagsIndex, createProductsIndex } from './schema';

export const syncProductsWithElasticSearch = async () => {
  try {
    const indexExists = await esClient.indices.exists({
      index: productIndexName,
    });
    if (indexExists) {
      await esClient.indices.delete({ index: productIndexName });
    }
    await createProductTagsIndex();
    await createProductsIndex();

    const batchSize = 10000;
    const totalCount = await prisma.product.count();
    const offsetPositions = Array.from(
      { length: Math.ceil(totalCount / batchSize) },
      (_, index) => index * batchSize,
    );
    const uniqueProudctTags: string[] = [];
    await Promise.allSettled(
      offsetPositions.map(async (offset) => {
        const products = await prisma.product.findMany({
          include: { category: true, images: true },
          skip: offset,
          take: batchSize,
        });

        const elasticProducts = products.map((product) => {
          uniqueProudctTags.push(
            ...(product.tags?.split(',').map((t) => t.trim()) ?? []),
          );
          return [
            { index: { _index: productIndexName, _id: product.id } },
            {
              ...product,
              category: product.category.name,
            },
          ];
        });

        await esClient.bulk({
          refresh: true,
          body: elasticProducts.flat(),
        });
      }),
    );
    const elasticProductTags = Array.from(new Set(uniqueProudctTags)).map(
      (tag, i) => {
        return [
          {
            index: {
              _index: productTagIndexName,
              _id: `tag-${i}`,
            },
          },
          {
            frequency: 0,
            tags: tag,
            createdAt: new Date(),
          },
        ];
      },
    );
    const tagOffSetPositions = Array.from(
      { length: Math.ceil(elasticProductTags.length / batchSize) },
      (_, index) => index * batchSize,
    );
    await Promise.all(
      tagOffSetPositions.map(async (offset) => {
        const batch = elasticProductTags.slice(offset, offset + batchSize);
        const bulkBody = batch.flat();
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

export const addNewProductTag = async (tags: string) => {
  return esClient.index({
    index: productTagIndexName,
    body: {
      frequency: 1,
      tags,
      createdAt: new Date(),
    },
  });
};
