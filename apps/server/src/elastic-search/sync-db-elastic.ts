import { prisma } from '@ecommerce/database';

import { esClient, productIndexName } from './elastic';
import { createProductElasticIndex } from './schema';

export const syncProductsWithElasticSearch = async () => {
  try {
    const indexExists = await esClient.indices.exists({
      index: productIndexName,
    });
    if (!indexExists) {
      await createProductElasticIndex();
    }
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    const payload = products.map((product) => {
      return [
        {
          index: {
            _index: productIndexName,
            _type: '_doc',
            _id: product.id,
          },
        },
        {
          name: product.name,
          description: product.description,
          id: product.id,
          category: product.category.name,
        },
      ];
    });
    const insertBulkData = await esClient.bulk({
      refresh: true,
      body: payload,
    });
    console.log(insertBulkData.errors);
  } catch (e) {
    console.log(e);
  }
};
