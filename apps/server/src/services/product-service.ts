import stopwords from 'natural';

import type { Product, Prisma, DeviceType } from '@ecommerce/database';
import {
  ProductIdSchema,
  ProductPartialSchema,
  ProductSchema,
  prisma,
} from '@ecommerce/database';

import { matchMostSimilarQuery } from '~/nlp/match-similar-word';

import { redisClient } from '../redis/redis';
import { redisProductSchema } from '../redis/schema';
import { ProductSearchHistoryService } from './product-search-history-service';

export class ProductService {
  private readonly productSearchHistoryService =
    new ProductSearchHistoryService();
  async list(page = 1, pageSize = 10): Promise<Product[]> {
    return prisma.product.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async create(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      const result = ProductSchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return prisma.product.create({ data: result });
    } catch (e) {
      return null;
    }
  }

  async upsert(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      const result = ProductSchema.parse(data);
      return prisma.product.upsert({
        where: { url: result.url },
        create: result,
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
    const { id: Id } = ProductIdSchema.parse({ id });
    return prisma.product.findUnique({ where: { id: Id } });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Product | null> {
    try {
      const { id: Id } = ProductIdSchema.parse({ id });
      const result = ProductPartialSchema.parse(data);
      await prisma.product.update({ where: { id: Id }, data: result });
      return prisma.product.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<Product | null> {
    try {
      const { id: Id } = ProductIdSchema.parse({ id });
      const deletedProduct = await prisma.product.delete({ where: { id: Id } });
      return deletedProduct;
    } catch (error) {
      return null;
    }
  }

  async searchProducts({
    searchQuery,
    ip,
    deviceType,
  }: {
    searchQuery: string;
    ip: string;
    deviceType: DeviceType;
  }) {
    try {
      const products: Product[] = await prisma.$queryRaw`
      SELECT *
      FROM Product
      WHERE MATCH(name, description,tags) AGAINST (${searchQuery} IN NATURAL LANGUAGE MODE)
      order by id desc LIMIT 20 ;
    `;
      void this.productSearchHistoryService.create({
        keyword: searchQuery,
        ip,
        deviceType,
        location: 'kathmandu',
        resultsCount: products.length,
        newKeyword: true,
      });
      return products;
    } catch (e) {
      return [];
    }
  }

  async searchWithRedisStack(searchQuery: string) {
    try {
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
