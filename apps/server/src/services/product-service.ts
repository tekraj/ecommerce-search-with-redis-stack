import stopwords from 'natural';

import type { Product, Prisma } from '@ecommerce/database';
import { prisma } from '@ecommerce/database';

import { matchMostSimilarQuery } from '~/nlp/match-similar-word';

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
      const products: Product[] = await prisma.$queryRaw`
      SELECT *
      FROM Product
      WHERE MATCH(name, description) AGAINST (${searchQuery} IN NATURAL LANGUAGE MODE)
      order by id desc LIMIT 20 ;
    `;
      return products
        .flatMap((p) => p.tags?.split(','))
        .filter((p) => p)
        .slice(0, 20);
    } catch (e) {
      return null;
    }
  }

  async searchWithElasticSearch(searchQuery: string) {
    try {
      const results = await esClient.search({
        index: productIndexName,
        body: {
          size: 100, // Return only the first 100 results
          query: {
            multi_match: {
              query: searchQuery,
              fields: ['name^3', 'description', 'tags'],
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
      const tags = results.hits.hits
        .map((h) => {
          return h._source
            ? {
                ...(h._source as Product),
              }
            : null;
        })
        .filter((h) => h)
        .flatMap((p) => p?.tags?.split(','))
        .filter((p) => p) as string[];
      const mostSimilarTags = matchMostSimilarQuery(tags, searchQuery);
      return mostSimilarTags.splice(0, 20);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async searchWithRedisStack(searchQuery: string) {
    try {
      console.log(stopwords.stopwords);
      const client = await redisClient();
      const spellingFixedQuery = (
        await Promise.all(
          searchQuery.split(' ').map(async (word) => {
            if (stopwords.stopwords.includes(word.toLowerCase())) return;
            const checkSpelling = await client.ft.spellCheck(
              `idx:${redisProductSchema}`,
              word,
            );
            return checkSpelling[0]?.suggestions[0]?.suggestion ?? word;
          }),
        )
      ).filter((w) => w);
      const results = await client.ft.search(
        `idx:${redisProductSchema}`,
        `@name:(${spellingFixedQuery.join(' ')}) | @description:(${spellingFixedQuery.join(' ')}) `,
        {
          LIMIT: {
            from: 0,
            size: 100,
          },
          SCORER: 'BM25',
        },
      );
      const tags = results.documents
        .map((d) => ({
          ...(d.value as unknown as Product),
        }))
        .flatMap((p) => p.tags?.split(','))
        .filter((p) => p) as string[];
      const mostSimilarTags = matchMostSimilarQuery(tags, searchQuery);
      return mostSimilarTags.splice(0, 20);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
