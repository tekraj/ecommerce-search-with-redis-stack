import type { Prisma, ProductSearchHistory } from '@ecommerce/database';
import { ProductSearchHistorySchema, prisma } from '@ecommerce/database';

import { addNewProductTag } from '~/elastic-search/sync';

export class ProductSearchHistoryService {
  async list(page = 1, pageSize = 10): Promise<ProductSearchHistory[]> {
    return prisma.productSearchHistory.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }

  async create(
    data: Prisma.ProductSearchHistoryCreateInput,
  ): Promise<ProductSearchHistory | null> {
    try {
      const newKeyword = prisma.productSearchHistory.findFirst({
        where: { keyword: data.keyword },
      });
      data.newKeyword = Boolean(newKeyword);
      data.location = 'Kathmandu';
      const result = ProductSearchHistorySchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const history = await prisma.productSearchHistory.create({
        data: result,
      });
      if (result.resultsCount > 0) {
        await addNewProductTag(data.keyword);
      }
      return history;
    } catch (e) {
      return null;
    }
  }

  async getById(id: number): Promise<ProductSearchHistory | null> {
    return prisma.productSearchHistory.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<ProductSearchHistory | null> {
    try {
      await prisma.productSearchHistory.update({ where: { id }, data });
      return prisma.productSearchHistory.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<ProductSearchHistory | null> {
    try {
      const deletedItem = await prisma.productSearchHistory.delete({
        where: { id },
      });
      return deletedItem;
    } catch (error) {
      return null;
    }
  }
}
