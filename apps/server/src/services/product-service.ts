import type { Product, Prisma } from '@ecommerce/database';
import { prisma } from '@ecommerce/database';

import { esClient, productIndexName } from '../elastic-search/elastic';
import { redisClient } from '../redis/redis';
import { redisProductSchema } from '../redis/schema';

export class ProductService {
  async list(page = 1, pageSize = 10): Promise<Product[]> {
    return prisma.product.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      return prisma.product.create({ data });
    } catch (e) {
      return null;
    }
  }

  async upsert(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      return prisma.product.upsert({
        where: { url: data.url },
        create: data,
        update: { updatedAt: new Date() },
      });
    } catch (e) {
      return null;
    }
  }

  async insertBatch(
    data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Prisma.BatchPayload | null> {
    try {
      const createdProducts = await prisma.product.createMany({ data });
      return createdProducts;
    } catch (error) {
      console.log('Error inserting products:', error);
      return null;
    }
  }

  async getById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Product | null> {
    try {
      await prisma.product.update({ where: { id }, data });
      return prisma.product.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<Product | null> {
    try {
      const deletedProduct = await prisma.product.delete({ where: { id } });
      return deletedProduct;
    } catch (error) {
      return null;
    }
  }

  async search(searchQuery: string) {
    try {
      return prisma.$queryRaw`
      SELECT *
      FROM Product
      WHERE MATCH(name, description) AGAINST (${searchQuery} IN NATURAL LANGUAGE MODE)
      order by id desc LIMIT 20 ;
    `;
    } catch (e) {
      return null;
    }
  }

  async searchWithElasticSearch(searchQuery: string) {
    try {
      const results = await esClient.search({
        index: productIndexName,
        body: {
          size: 20, // Return only the first 20 results
          query: {
            multi_match: {
              query: searchQuery,
              fields: ['name^3', 'description', 'category^5'],
              type: 'best_fields',
              fuzziness: 'AUTO',
              operator: 'AND',
              tie_breaker: 0.3,
              minimum_should_match: '75%',
              boost: 2,
            },
          },
        },
      });
      return results.hits.hits
        .map((h) => {
          return h._source
            ? {
                ...h._source,
              }
            : null;
        })
        .filter((h) => h);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async searchWithRedisStack(searchQuery: string) {
    try {
      const client = await redisClient();
      const spellingFixedQuery = (
        await Promise.all(
          searchQuery.split(' ').map(async (word) => {
            const checkSpelling = await client.ft.spellCheck(
              `idx:${redisProductSchema}`,
              word,
            );
            return checkSpelling[0]?.suggestions[0]?.suggestion ?? word;
          }),
        )
      )
        .map((w) => w)
        .join(' ');
      const results = await client.ft.search(
        `idx:${redisProductSchema}`,
        `@name:(${spellingFixedQuery}) | @description:(${spellingFixedQuery}) | @category:(${spellingFixedQuery})`,
        {
          LIMIT: {
            from: 0,
            size: 20,
          },
          SCORER: 'BM25',
        },
      );
      return results.documents.map((d) => ({
        ...d.value,
      }));
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
