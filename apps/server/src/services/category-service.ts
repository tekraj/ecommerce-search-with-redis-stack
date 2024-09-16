import type { Category, Prisma } from '@ecommerce/database';
import {
  CategoryIdSchema,
  CategoryPartialSchema,
  CategorySchema,
  prisma,
} from '@ecommerce/database';

export class CategoryService {
  async list(page = 1, limit = 100) {
    return prisma.category.findMany({
      include: { childCategories: true },
      take: limit,
      skip: (page - 1) * limit,
      where: { parent_id: null, childCategories: { some: {} } },
    });
  }

  async create(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      const result = CategorySchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return prisma.category.create({ data: result });
    } catch (e) {
      return null;
    }
  }

  async upsert(data: Prisma.CategoryCreateInput): Promise<Category | null> {
    try {
      const result = CategorySchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return prisma.category.upsert({
        where: { url: result.url },
        create: result,
        update: { updatedAt: new Date() },
      });
    } catch (e) {
      return null;
    }
  }

  async getById(id: number): Promise<Category | null> {
    const { id: Id } = CategoryIdSchema.parse({ id });
    return prisma.category.findUnique({ where: { id: Id } });
  }

  async update(
    id: number,
    data: Prisma.CategoryUpdateInput,
  ): Promise<Category | null> {
    try {
      const result = CategoryPartialSchema.parse({
        ...data,
        updatedAt: new Date(),
      });
      await prisma.category.update({ where: { id }, data: result });
      return prisma.category.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }

  async delete(id: number): Promise<Category | null> {
    try {
      const { id: Id } = CategoryIdSchema.parse({ id });
      const deletedCategory = await prisma.category.delete({
        where: { id: Id },
      });
      return deletedCategory;
    } catch (error) {
      return null;
    }
  }
}
