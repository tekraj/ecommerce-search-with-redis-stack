import type { Category, Prisma } from '@ecommerce/database';
import { prisma } from '@ecommerce/database';

export class CategoryService {
  async list(page = 1, limit = 10): Promise<Category[]> {
    return prisma.category.findMany({ take: limit, skip: (page - 1) * limit });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      return prisma.category.create({ data });
    } catch (e) {
      return null;
    }
  }

  async upsert(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      return prisma.category.upsert({
        where: { url: data.url },
        create: data,
        update: { updatedAt: new Date() },
      });
    } catch (e) {
      return null;
    }
  }

  async getById(id: number): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category | null> {
    try {
      await prisma.category.update({ where: { id }, data });
      return prisma.category.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<Category | null> {
    try {
      const deletedCategory = await prisma.category.delete({ where: { id } });
      return deletedCategory;
    } catch (error) {
      return null;
    }
  }
}
