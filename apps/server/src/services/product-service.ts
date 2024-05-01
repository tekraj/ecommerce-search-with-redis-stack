import type { Product, Prisma } from '@ecommerce/database';
import { prisma } from '@ecommerce/database';

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
      return prisma.product.findMany({
        where: {
          name: { search: searchQuery },
          description: { search: searchQuery },
        },
        take: 20,
      });
    } catch (e) {
      return null;
    }
  }
}
