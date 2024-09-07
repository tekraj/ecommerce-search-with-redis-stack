import { PrismaClient } from '@prisma/client';

import {
  CategorySchema,
  ProductImageSchema,
  ProductSchema,
  ProductSearchHistorySchema,
  UserSchema,
} from './validators';

export const prisma = new PrismaClient();
export const ProductIdSchema = ProductSchema.pick({ id: true });
export const ProductImageIdSchema = ProductImageSchema.pick({ id: true });
export const CategoryIdSchema = CategorySchema.pick({ id: true });
export const UserIdSchema = UserSchema.pick({ id: true });
export const ProductSearchHistoryIdSchema = ProductSearchHistorySchema.pick({
  id: true,
});
export * from '@prisma/client';
export * from './validators';
