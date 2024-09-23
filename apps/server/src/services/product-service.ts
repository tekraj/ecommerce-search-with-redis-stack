import slug from 'slug';

import type { Product, Prisma, DeviceType } from '@ecommerce/database';
import {
  ProductIdSchema,
  ProductPartialSchema,
  ProductSchema,
  prisma,
} from '@ecommerce/database';

import { matchMostSimilarQuery } from '~/nlp/match-similar-word';

import { ProductSearchHistoryService } from './product-search-history-service';

export class ProductService {
  private readonly productSearchHistoryService =
    new ProductSearchHistoryService();
  async list(page = 1, pageSize = 10) {
    const data = await prisma.product.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: { category: true, images: true },
    });
    const hasMore = (
      await prisma.product.findMany({
        take: 1,
        skip: (page - 1) * pageSize + 1,
      })
    ).length;
    return { data, hasMore };
  }

  async create(
    data: Omit<Prisma.ProductCreateInput, 'category' | 'url'> & {
      categoryId: number;
    },
  ): Promise<Product | null> {
    try {
      const result = ProductSchema.parse({
        ...data,
        url: slug(data.name),
        price: Number(data.price),
        discount: Number(data.discount),
        quantity: Number(data.quantity),
        categoryId: Number(data.categoryId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return prisma.product.create({ data: result as Product });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async upsert(data: Prisma.ProductCreateInput): Promise<Product | null> {
    try {
      const result = ProductSchema.parse(data);
      return prisma.product.upsert({
        where: { url: result.url },
        create: result as Product,
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
    return prisma.product.findUnique({
      where: { id: Id },
      include: { images: true, category: true },
    });
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
  async searchProductTag(searchQuery: string) {
    try {
      const products: Product[] = await prisma.$queryRaw`
      SELECT tags
      FROM Product
      WHERE MATCH(name, description,tags) AGAINST (${searchQuery} IN NATURAL LANGUAGE MODE)
      order by id desc LIMIT 20 ;
    `;
      return matchMostSimilarQuery(
        products
          .flatMap((p) => p.tags?.split(','))
          .filter((t) => t) as string[],
        searchQuery,
      );
    } catch (e) {
      return [];
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
      const productsWithImages = await Promise.all(
        products.map(async (p) => {
          const images = await prisma.productImage.findMany({
            where: { productId: p.id },
          });
          return { ...p, images };
        }),
      );
      void this.productSearchHistoryService.create({
        keyword: searchQuery,
        ip,
        deviceType,
        location: 'kathmandu',
        resultsCount: products.length,
        newKeyword: true,
      });
      return productsWithImages;
    } catch (e) {
      return [];
    }
  }

  async getProductsByCategoryId({
    categoryId,
    page = 1,
    pageSize = 100,
  }: {
    categoryId: number;
    page: number;
    pageSize: number;
  }) {
    try {
      return prisma.product.findMany({
        where: { categoryId },
        take: pageSize,
        skip: (page - 1) * pageSize,
        include: { images: true },
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
