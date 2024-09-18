import type { ProductImage, Prisma } from '@ecommerce/database';
import {
  ProductImageIdSchema,
  ProductImagePartialSchema,
  ProductImageSchema,
  prisma,
} from '@ecommerce/database';

export class ProductImageService {
  async list(page = 1, pageSize = 10) {
    const data = await prisma.productImage.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    const hasMore = (
      await prisma.productImage.findMany({
        take: 1,
        skip: (page - 1) * pageSize + 1,
      })
    ).length;
    return { data, hasMore };
  }

  async create(data: {
    productId: number;
    url: string;
  }): Promise<ProductImage | null> {
    try {
      const result = ProductImageSchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return prisma.productImage.create({ data: result as ProductImage });
    } catch (e) {
      return null;
    }
  }

  async upsert(
    data: Prisma.ProductImageCreateInput,
  ): Promise<ProductImage | null> {
    try {
      const result = ProductImageSchema.parse(data);
      return prisma.productImage.upsert({
        where: { id: result.id },
        create: result as ProductImage,
        update: { updatedAt: new Date() },
      });
    } catch (e) {
      return null;
    }
  }

  async insertBatch(
    data: Omit<ProductImage, 'id' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Prisma.BatchPayload | null> {
    try {
      const createdProductImages = await prisma.productImage.createMany({
        data,
      });
      return createdProductImages;
    } catch (error) {
      console.log('Error inserting productImages:', error);
      return null;
    }
  }

  async getById(id: number): Promise<ProductImage | null> {
    const { id: Id } = ProductImageIdSchema.parse({ id });
    return prisma.productImage.findUnique({
      where: { id: Id },
    });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<ProductImage | null> {
    try {
      const { id: Id } = ProductImageIdSchema.parse({ id });
      const result = ProductImagePartialSchema.parse(data);
      await prisma.productImage.update({ where: { id: Id }, data: result });
      return prisma.productImage.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<ProductImage | null> {
    try {
      const { id: Id } = ProductImageIdSchema.parse({ id });
      const deletedProductImage = await prisma.productImage.delete({
        where: { id: Id },
      });
      return deletedProductImage;
    } catch (error) {
      return null;
    }
  }
}
