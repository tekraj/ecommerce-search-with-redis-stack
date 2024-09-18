"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  CategoryIdSchema: () => CategoryIdSchema,
  CategoryOrderByRelevanceFieldEnumSchema: () => CategoryOrderByRelevanceFieldEnumSchema,
  CategoryPartialSchema: () => CategoryPartialSchema,
  CategoryScalarFieldEnumSchema: () => CategoryScalarFieldEnumSchema,
  CategorySchema: () => CategorySchema,
  DeviceTypeSchema: () => DeviceTypeSchema,
  NullsOrderSchema: () => NullsOrderSchema,
  ProductIdSchema: () => ProductIdSchema,
  ProductImageIdSchema: () => ProductImageIdSchema,
  ProductImageOrderByRelevanceFieldEnumSchema: () => ProductImageOrderByRelevanceFieldEnumSchema,
  ProductImagePartialSchema: () => ProductImagePartialSchema,
  ProductImageScalarFieldEnumSchema: () => ProductImageScalarFieldEnumSchema,
  ProductImageSchema: () => ProductImageSchema,
  ProductOrderByRelevanceFieldEnumSchema: () => ProductOrderByRelevanceFieldEnumSchema,
  ProductPartialSchema: () => ProductPartialSchema,
  ProductScalarFieldEnumSchema: () => ProductScalarFieldEnumSchema,
  ProductSchema: () => ProductSchema,
  ProductSearchHistoryIdSchema: () => ProductSearchHistoryIdSchema,
  ProductSearchHistoryOrderByRelevanceFieldEnumSchema: () => ProductSearchHistoryOrderByRelevanceFieldEnumSchema,
  ProductSearchHistoryPartialSchema: () => ProductSearchHistoryPartialSchema,
  ProductSearchHistoryScalarFieldEnumSchema: () => ProductSearchHistoryScalarFieldEnumSchema,
  ProductSearchHistorySchema: () => ProductSearchHistorySchema,
  SortOrderSchema: () => SortOrderSchema,
  TransactionIsolationLevelSchema: () => TransactionIsolationLevelSchema,
  UserIdSchema: () => UserIdSchema,
  UserOrderByRelevanceFieldEnumSchema: () => UserOrderByRelevanceFieldEnumSchema,
  UserPartialSchema: () => UserPartialSchema,
  UserScalarFieldEnumSchema: () => UserScalarFieldEnumSchema,
  UserSchema: () => UserSchema,
  prisma: () => prisma
});
module.exports = __toCommonJS(src_exports);
var import_client = require("@prisma/client");
var import_zod = require("zod");
__reExport(src_exports, require("@prisma/client"), module.exports);
var TransactionIsolationLevelSchema = import_zod.z.enum([
  "ReadUncommitted",
  "ReadCommitted",
  "RepeatableRead",
  "Serializable"
]);
var UserScalarFieldEnumSchema = import_zod.z.enum([
  "id",
  "email",
  "name",
  "password",
  "createdAt",
  "updatedAt"
]);
var CategoryScalarFieldEnumSchema = import_zod.z.enum([
  "id",
  "name",
  "parent_id",
  "url",
  "createdAt",
  "updatedAt"
]);
var ProductScalarFieldEnumSchema = import_zod.z.enum([
  "id",
  "name",
  "url",
  "description",
  "price",
  "quantity",
  "discount",
  "tags",
  "categoryId",
  "createdAt",
  "updatedAt"
]);
var ProductImageScalarFieldEnumSchema = import_zod.z.enum([
  "id",
  "url",
  "productId",
  "createdAt",
  "updatedAt"
]);
var ProductSearchHistoryScalarFieldEnumSchema = import_zod.z.enum([
  "id",
  "keyword",
  "userId",
  "ip",
  "deviceType",
  "location",
  "resultsCount",
  "newKeyword",
  "createdAt",
  "updatedAt"
]);
var SortOrderSchema = import_zod.z.enum(["asc", "desc"]);
var UserOrderByRelevanceFieldEnumSchema = import_zod.z.enum([
  "email",
  "name",
  "password"
]);
var NullsOrderSchema = import_zod.z.enum(["first", "last"]);
var CategoryOrderByRelevanceFieldEnumSchema = import_zod.z.enum(["name", "url"]);
var ProductOrderByRelevanceFieldEnumSchema = import_zod.z.enum([
  "name",
  "url",
  "description",
  "tags"
]);
var ProductImageOrderByRelevanceFieldEnumSchema = import_zod.z.enum(["url"]);
var ProductSearchHistoryOrderByRelevanceFieldEnumSchema = import_zod.z.enum([
  "keyword",
  "ip",
  "location"
]);
var DeviceTypeSchema = import_zod.z.enum([
  "DESKTOP",
  "MOBILE",
  "TABLET",
  "OTHER"
]);
var UserSchema = import_zod.z.object({
  id: import_zod.z.number().int().optional(),
  email: import_zod.z.string(),
  name: import_zod.z.string(),
  password: import_zod.z.string(),
  createdAt: import_zod.z.coerce.date(),
  updatedAt: import_zod.z.coerce.date()
});
var UserPartialSchema = UserSchema.partial();
var CategorySchema = import_zod.z.object({
  id: import_zod.z.number().int().optional(),
  name: import_zod.z.string(),
  parent_id: import_zod.z.number().int().nullable(),
  url: import_zod.z.string(),
  createdAt: import_zod.z.coerce.date(),
  updatedAt: import_zod.z.coerce.date()
});
var CategoryPartialSchema = CategorySchema.partial();
var ProductSchema = import_zod.z.object({
  id: import_zod.z.number().int().optional(),
  name: import_zod.z.string(),
  url: import_zod.z.string(),
  description: import_zod.z.string(),
  price: import_zod.z.number(),
  quantity: import_zod.z.number().int(),
  discount: import_zod.z.number(),
  tags: import_zod.z.string().nullable(),
  categoryId: import_zod.z.number().int().optional(),
  createdAt: import_zod.z.coerce.date(),
  updatedAt: import_zod.z.coerce.date()
});
var ProductPartialSchema = ProductSchema.partial();
var ProductImageSchema = import_zod.z.object({
  id: import_zod.z.number().int().optional(),
  url: import_zod.z.string(),
  productId: import_zod.z.number().int().optional(),
  createdAt: import_zod.z.coerce.date(),
  updatedAt: import_zod.z.coerce.date()
});
var ProductImagePartialSchema = ProductImageSchema.partial();
var ProductSearchHistorySchema = import_zod.z.object({
  deviceType: DeviceTypeSchema,
  id: import_zod.z.number().int().optional(),
  keyword: import_zod.z.string(),
  userId: import_zod.z.number().int().nullable(),
  ip: import_zod.z.string(),
  location: import_zod.z.string().nullable(),
  resultsCount: import_zod.z.number().int(),
  newKeyword: import_zod.z.boolean(),
  createdAt: import_zod.z.coerce.date(),
  updatedAt: import_zod.z.coerce.date()
});
var ProductSearchHistoryPartialSchema = ProductSearchHistorySchema.partial();
var prisma = new import_client.PrismaClient();
var ProductIdSchema = ProductSchema.pick({ id: true });
var ProductImageIdSchema = ProductImageSchema.pick({ id: true });
var CategoryIdSchema = CategorySchema.pick({ id: true });
var UserIdSchema = UserSchema.pick({ id: true });
var ProductSearchHistoryIdSchema = ProductSearchHistorySchema.pick({
  id: true
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CategoryIdSchema,
  CategoryOrderByRelevanceFieldEnumSchema,
  CategoryPartialSchema,
  CategoryScalarFieldEnumSchema,
  CategorySchema,
  DeviceTypeSchema,
  NullsOrderSchema,
  ProductIdSchema,
  ProductImageIdSchema,
  ProductImageOrderByRelevanceFieldEnumSchema,
  ProductImagePartialSchema,
  ProductImageScalarFieldEnumSchema,
  ProductImageSchema,
  ProductOrderByRelevanceFieldEnumSchema,
  ProductPartialSchema,
  ProductScalarFieldEnumSchema,
  ProductSchema,
  ProductSearchHistoryIdSchema,
  ProductSearchHistoryOrderByRelevanceFieldEnumSchema,
  ProductSearchHistoryPartialSchema,
  ProductSearchHistoryScalarFieldEnumSchema,
  ProductSearchHistorySchema,
  SortOrderSchema,
  TransactionIsolationLevelSchema,
  UserIdSchema,
  UserOrderByRelevanceFieldEnumSchema,
  UserPartialSchema,
  UserScalarFieldEnumSchema,
  UserSchema,
  prisma,
  ...require("@prisma/client")
});
//# sourceMappingURL=index.js.map
