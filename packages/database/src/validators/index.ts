import { z } from 'zod';
import type { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UserScalarFieldEnumSchema = z.enum(['id','email','name','password','createdAt','updatedAt']);

export const CategoryScalarFieldEnumSchema = z.enum(['id','name','parent_id','url','createdAt','updatedAt']);

export const ProductScalarFieldEnumSchema = z.enum(['id','name','url','description','price','quantity','discount','tags','categoryId','createdAt','updatedAt']);

export const ProductImageScalarFieldEnumSchema = z.enum(['id','url','productId','createdAt','updatedAt']);

export const ProductSearchHistoryScalarFieldEnumSchema = z.enum(['id','keyword','userId','ip','deviceType','location','resultsCount','newKeyword','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const UserOrderByRelevanceFieldEnumSchema = z.enum(['email','name','password']);

export const NullsOrderSchema = z.enum(['first','last']);

export const CategoryOrderByRelevanceFieldEnumSchema = z.enum(['name','url']);

export const ProductOrderByRelevanceFieldEnumSchema = z.enum(['name','url','description','tags']);

export const ProductImageOrderByRelevanceFieldEnumSchema = z.enum(['url']);

export const ProductSearchHistoryOrderByRelevanceFieldEnumSchema = z.enum(['keyword','ip','location']);

export const DeviceTypeSchema = z.enum(['DESKTOP','MOBILE','TABLET','OTHER']);

export type DeviceTypeType = `${z.infer<typeof DeviceTypeSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string(),
  password: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type User = z.infer<typeof UserSchema>

/////////////////////////////////////////
// USER PARTIAL SCHEMA
/////////////////////////////////////////

export const UserPartialSchema = UserSchema.partial()

export type UserPartial = z.infer<typeof UserPartialSchema>

/////////////////////////////////////////
// CATEGORY SCHEMA
/////////////////////////////////////////

export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  parent_id: z.number().int().nullable(),
  url: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Category = z.infer<typeof CategorySchema>

/////////////////////////////////////////
// CATEGORY PARTIAL SCHEMA
/////////////////////////////////////////

export const CategoryPartialSchema = CategorySchema.partial()

export type CategoryPartial = z.infer<typeof CategoryPartialSchema>

/////////////////////////////////////////
// PRODUCT SCHEMA
/////////////////////////////////////////

export const ProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
  price: z.number(),
  quantity: z.number().int(),
  discount: z.number(),
  tags: z.string().nullable(),
  categoryId: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Product = z.infer<typeof ProductSchema>

/////////////////////////////////////////
// PRODUCT PARTIAL SCHEMA
/////////////////////////////////////////

export const ProductPartialSchema = ProductSchema.partial()

export type ProductPartial = z.infer<typeof ProductPartialSchema>

/////////////////////////////////////////
// PRODUCT IMAGE SCHEMA
/////////////////////////////////////////

export const ProductImageSchema = z.object({
  id: z.number().int(),
  url: z.string(),
  productId: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductImage = z.infer<typeof ProductImageSchema>

/////////////////////////////////////////
// PRODUCT IMAGE PARTIAL SCHEMA
/////////////////////////////////////////

export const ProductImagePartialSchema = ProductImageSchema.partial()

export type ProductImagePartial = z.infer<typeof ProductImagePartialSchema>

/////////////////////////////////////////
// PRODUCT SEARCH HISTORY SCHEMA
/////////////////////////////////////////

export const ProductSearchHistorySchema = z.object({
  deviceType: DeviceTypeSchema,
  id: z.number().int(),
  keyword: z.string(),
  userId: z.number().int().nullable(),
  ip: z.string(),
  location: z.string().nullable(),
  resultsCount: z.number().int(),
  newKeyword: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProductSearchHistory = z.infer<typeof ProductSearchHistorySchema>

/////////////////////////////////////////
// PRODUCT SEARCH HISTORY PARTIAL SCHEMA
/////////////////////////////////////////

export const ProductSearchHistoryPartialSchema = ProductSearchHistorySchema.partial()

export type ProductSearchHistoryPartial = z.infer<typeof ProductSearchHistoryPartialSchema>