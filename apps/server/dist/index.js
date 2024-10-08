// src/index.ts
import cors from "cors";
import "dotenv/config";
import express3 from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

// src/env.mjs
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
var env = createEnv({
  server: {
    REDIS_URL: z.string().default("localhost"),
    REDIS_PORT: z.string().or(z.number()).default(6379),
    REDIS_PASSWORD: z.string().default("ecommerce"),
    PORT: z.string().or(z.number()).default(5e3),
    ELASTIC_SEARCH_URL: z.string().default("ecommerce-elasticsearch"),
    ELASTIC_SEARCH_PORT: z.string().or(z.number()).default(9300),
    JWT_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    S3_BUCKET: z.string(),
    AWS_REGION: z.string().default("us-east"),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string()
  },
  runtimeEnv: {
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    PORT: process.env.PORT,
    ELASTIC_SEARCH_URL: process.env.ELASTIC_SEARCH_URL,
    ELASTIC_SEARCH_PORT: process.env.ELASTIC_SEARCH_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    S3_BUCKET: process.env.S3_BUCKET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
  },
  emptyStringAsUndefined: true
});

// src/routes/admin-router.ts
import * as clientS3 from "@aws-sdk/client-s3";
import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";

// src/services/user-service.ts
import {
  UserPartialSchema,
  UserSchema,
  prisma,
  UserIdSchema
} from "@ecommerce/database";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createJWTToken = (user) => {
  return jwt.sign({ email: user.email, name: user.name }, env.JWT_SECRET, {
    expiresIn: "1d"
  });
};
var authenticateToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(new Error("Invalid Key"));
      } else {
        resolve(payload);
      }
    });
  });
};

// src/utils/password.ts
import bcrypt from "bcrypt";
var hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};
var comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// src/services/user-service.ts
var UserService = class {
  async list(page = 1, limit = 100) {
    return prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit
    });
  }
  async create(data) {
    try {
      const result = UserSchema.parse({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      result.password = await hashPassword(result.password);
      return prisma.user.create({ data: result });
    } catch (e) {
      return null;
    }
  }
  async upsert(data) {
    try {
      const result = UserSchema.parse({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      result.password = await hashPassword(result.password);
      return prisma.user.upsert({
        where: { email: result.email },
        create: result,
        update: { updatedAt: /* @__PURE__ */ new Date() }
      });
    } catch (e) {
      return null;
    }
  }
  async getById(id) {
    const { id: Id } = UserIdSchema.parse({ id });
    return prisma.user.findUnique({ where: { id: Id } });
  }
  async getByEmail(email) {
    try {
      const { email: Email } = UserSchema.pick({ email: true }).parse({
        email
      });
      return prisma.user.findUnique({ where: { email: Email } });
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async update(id, data) {
    try {
      const result = UserPartialSchema.parse({
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (result.password) {
        result.password = await hashPassword(result.password);
      }
      await prisma.user.update({ where: { id }, data: result });
      return prisma.user.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }
  async delete(id) {
    try {
      const { id: Id } = UserIdSchema.parse({ id });
      const deleteUser = await prisma.user.delete({
        where: { id: Id }
      });
      return deleteUser;
    } catch (error) {
      return null;
    }
  }
  async login({ email, password }) {
    try {
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return null;
      }
      const matchPassword = await comparePassword(password, user.password);
      if (!matchPassword) {
        return null;
      }
      const token = createJWTToken(user);
      return { ...user, token };
    } catch (error) {
      return null;
    }
  }
  async validateUserByToken(token) {
    try {
      const { email } = await authenticateToken(token);
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        return null;
      }
      const refreshedToken = createJWTToken(user);
      return { ...user, token: refreshedToken };
    } catch (e) {
      return null;
    }
  }
};

// src/middlewares/admin-middleware.ts
var userService = new UserService();
var adminMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.split(" ")[1];
    if (!authToken) {
      res.status(401).send("Unauthorized: Missing Authorization Header");
      return;
    }
    const { email } = await authenticateToken(authToken);
    const user = await userService.getByEmail(email);
    if (!user) {
      res.status(403).send("Forbidden: Invalid Token");
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).send("Forbidden: Invalid Token");
  }
};

// src/services/category-service.ts
import slug from "slug";
import {
  CategoryIdSchema,
  CategoryPartialSchema,
  CategorySchema,
  prisma as prisma2
} from "@ecommerce/database";
var CategoryService = class {
  async list(page = 1, limit = 100) {
    return prisma2.category.findMany({
      include: { childCategories: true },
      take: limit,
      skip: (page - 1) * limit,
      where: { parent_id: null, childCategories: { some: {} } }
    });
  }
  async create(data) {
    try {
      const result = CategorySchema.parse({
        ...data,
        url: slug(data.name),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      return prisma2.category.create({ data: result });
    } catch (e) {
      return null;
    }
  }
  async upsert(data) {
    try {
      const result = CategorySchema.parse({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      return prisma2.category.upsert({
        where: { url: result.url },
        create: result,
        update: { updatedAt: /* @__PURE__ */ new Date() }
      });
    } catch (e) {
      return null;
    }
  }
  async getById(id) {
    const { id: Id } = CategoryIdSchema.parse({ id });
    return prisma2.category.findUnique({ where: { id: Id } });
  }
  async update(id, data) {
    try {
      const result = CategoryPartialSchema.parse({
        ...data,
        updatedAt: /* @__PURE__ */ new Date()
      });
      await prisma2.category.update({ where: { id }, data: result });
      return prisma2.category.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }
  async delete(id) {
    try {
      const { id: Id } = CategoryIdSchema.parse({ id });
      const deletedCategory = await prisma2.category.delete({
        where: { id: Id }
      });
      return deletedCategory;
    } catch (error) {
      return null;
    }
  }
};

// src/services/product-image-service.ts
import {
  ProductImageIdSchema,
  ProductImagePartialSchema,
  ProductImageSchema,
  prisma as prisma3
} from "@ecommerce/database";
var ProductImageService = class {
  async list(page = 1, pageSize = 10) {
    const data = await prisma3.productImage.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize
    });
    const hasMore = (await prisma3.productImage.findMany({
      take: 1,
      skip: (page - 1) * pageSize + 1
    })).length;
    return { data, hasMore };
  }
  async create(data) {
    try {
      const result = ProductImageSchema.parse({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      return prisma3.productImage.create({ data: result });
    } catch (e) {
      return null;
    }
  }
  async upsert(data) {
    try {
      const result = ProductImageSchema.parse(data);
      return prisma3.productImage.upsert({
        where: { id: result.id },
        create: result,
        update: { updatedAt: /* @__PURE__ */ new Date() }
      });
    } catch (e) {
      return null;
    }
  }
  async insertBatch(data) {
    try {
      const createdProductImages = await prisma3.productImage.createMany({
        data
      });
      return createdProductImages;
    } catch (error) {
      console.log("Error inserting productImages:", error);
      return null;
    }
  }
  async getById(id) {
    const { id: Id } = ProductImageIdSchema.parse({ id });
    return prisma3.productImage.findUnique({
      where: { id: Id }
    });
  }
  async update(id, data) {
    try {
      const { id: Id } = ProductImageIdSchema.parse({ id });
      const result = ProductImagePartialSchema.parse(data);
      await prisma3.productImage.update({ where: { id: Id }, data: result });
      return prisma3.productImage.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }
  async delete(id) {
    try {
      const { id: Id } = ProductImageIdSchema.parse({ id });
      const deletedProductImage = await prisma3.productImage.delete({
        where: { id: Id }
      });
      return deletedProductImage;
    } catch (error) {
      return null;
    }
  }
};

// src/services/product-service.ts
import stopwords from "natural";
import slug2 from "slug";
import {
  ProductIdSchema,
  ProductPartialSchema,
  ProductSchema,
  prisma as prisma6
} from "@ecommerce/database";

// src/nlp/match-similar-word.ts
var tokenize = (text) => {
  return text.toLowerCase().split(/\s+/);
};
var computeTF = (tokens) => {
  const totalCount = tokens.length;
  const counts = tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
  return Object.fromEntries(
    Object.entries(counts).map(([token, count]) => [token, count / totalCount])
  );
};
var computeIDF = (corpus, token) => {
  const documentCount = corpus.filter((doc) => doc.includes(token)).length;
  return Math.log(corpus.length / documentCount + 1);
};
var matchMostSimilarQuery = (productTags, searchQuery) => {
  const searchTokens = tokenize(searchQuery);
  const productTokens = productTags.map((tag) => tokenize(tag));
  const tfSearch = computeTF(searchTokens);
  const idf = Object.fromEntries(
    searchTokens.map((token) => [token, computeIDF(productTokens, token)])
  );
  const tfidfSearch = Object.fromEntries(
    Object.entries(tfSearch).map(([token, tf]) => [
      token,
      tf * (idf[token] || 0)
    ])
  );
  return Array.from(
    new Set(
      productTags.map((tag) => {
        const tfProduct = computeTF(tokenize(tag));
        const tfidfProduct = Object.fromEntries(
          Object.entries(tfProduct).map(([token, tf]) => [
            token,
            tf * (idf[token] || 0)
          ])
        );
        const similarity = Object.keys(tfidfSearch).reduce(
          (acc, token) => acc + (tfidfSearch[token] || 0) * (tfidfProduct[token] || 0),
          0
        );
        return { similarity, tag };
      }).sort((a, b) => b.similarity - a.similarity).map((t) => t.tag)
    )
  );
};

// src/redis/redis.ts
import { createClient } from "redis";
var client;
var redisClient = async () => {
  if (client) {
    return client;
  }
  const redisHost = env.REDIS_URL;
  const redisPort = env.REDIS_PORT;
  client = await createClient({
    url: `redis://${redisHost}:${redisPort}`,
    password: env.REDIS_PASSWORD
  }).on("error", (err) => {
    console.log(err);
  }).connect();
  return client;
};

// src/redis/schema.ts
import { SchemaFieldTypes } from "redis";
var redisProductSchema = "products";

// src/services/product-search-history-service.ts
import * as geoip from "geoip-lite";
import { ProductSearchHistorySchema, prisma as prisma5 } from "@ecommerce/database";

// src/elastic-search/sync.ts
import { prisma as prisma4 } from "@ecommerce/database";

// src/elastic-search/elastic.ts
import { Client } from "@elastic/elasticsearch";
var esClient = new Client({
  node: `${env.ELASTIC_SEARCH_URL}:${env.ELASTIC_SEARCH_PORT}`
});
var productTagIndexName = "product-tags";

// src/elastic-search/sync.ts
var addNewProductTag = async (tags) => {
  return esClient.index({
    index: productTagIndexName,
    body: {
      frequency: 1,
      tags,
      createdAt: /* @__PURE__ */ new Date()
    }
  });
};

// src/services/product-search-history-service.ts
var ProductSearchHistoryService = class {
  async list(page = 1, pageSize = 10) {
    return prisma5.productSearchHistory.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize
    });
  }
  async create(data) {
    try {
      const newKeyword = prisma5.productSearchHistory.findFirst({
        where: { keyword: data.keyword }
      });
      data.newKeyword = Boolean(newKeyword);
      const location = geoip.lookup(data.ip);
      data.location = Object.values(location ?? { city: "Kathmandu" }).join(
        ", "
      );
      const result = ProductSearchHistorySchema.parse({
        ...data,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const history = await prisma5.productSearchHistory.create({
        data: result
      });
      if (result.resultsCount > 0) {
        await addNewProductTag(data.keyword);
      }
      return history;
    } catch (e) {
      return null;
    }
  }
  async getById(id) {
    return prisma5.productSearchHistory.findUnique({ where: { id } });
  }
  async update(id, data) {
    try {
      await prisma5.productSearchHistory.update({ where: { id }, data });
      return prisma5.productSearchHistory.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }
  async delete(id) {
    try {
      const deletedItem = await prisma5.productSearchHistory.delete({
        where: { id }
      });
      return deletedItem;
    } catch (error) {
      return null;
    }
  }
};

// src/services/product-service.ts
var ProductService = class {
  productSearchHistoryService = new ProductSearchHistoryService();
  async list(page = 1, pageSize = 10) {
    const data = await prisma6.product.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: { category: true }
    });
    const hasMore = (await prisma6.product.findMany({
      take: 1,
      skip: (page - 1) * pageSize + 1
    })).length;
    return { data, hasMore };
  }
  async create(data) {
    try {
      const result = ProductSchema.parse({
        ...data,
        url: slug2(data.name),
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      return prisma6.product.create({ data: result });
    } catch (e) {
      return null;
    }
  }
  async upsert(data) {
    try {
      const result = ProductSchema.parse(data);
      return prisma6.product.upsert({
        where: { url: result.url },
        create: result,
        update: { updatedAt: /* @__PURE__ */ new Date() }
      });
    } catch (e) {
      return null;
    }
  }
  async insertBatch(data) {
    try {
      const createdProducts = await prisma6.product.createMany({ data });
      return createdProducts;
    } catch (error) {
      console.log("Error inserting products:", error);
      return null;
    }
  }
  async getById(id) {
    const { id: Id } = ProductIdSchema.parse({ id });
    return prisma6.product.findUnique({
      where: { id: Id },
      include: { images: true }
    });
  }
  async update(id, data) {
    try {
      const { id: Id } = ProductIdSchema.parse({ id });
      const result = ProductPartialSchema.parse(data);
      await prisma6.product.update({ where: { id: Id }, data: result });
      return prisma6.product.findUnique({ where: { id } });
    } catch (error) {
      return null;
    }
  }
  async delete(id) {
    try {
      const { id: Id } = ProductIdSchema.parse({ id });
      const deletedProduct = await prisma6.product.delete({ where: { id: Id } });
      return deletedProduct;
    } catch (error) {
      return null;
    }
  }
  async searchProducts({
    searchQuery,
    ip,
    deviceType
  }) {
    try {
      const products = await prisma6.$queryRaw`
      SELECT *
      FROM Product
      WHERE MATCH(name, description,tags) AGAINST (${searchQuery} IN NATURAL LANGUAGE MODE)
      order by id desc LIMIT 20 ;
    `;
      void this.productSearchHistoryService.create({
        keyword: searchQuery,
        ip,
        deviceType,
        location: "kathmandu",
        resultsCount: products.length,
        newKeyword: true
      });
      return products;
    } catch (e) {
      return [];
    }
  }
  async searchWithRedisStack(searchQuery) {
    try {
      const client2 = await redisClient();
      const spellingFixedQuery = (await Promise.all(
        searchQuery.split(" ").map(async (word) => {
          if (stopwords.stopwords.includes(word.toLowerCase()))
            return;
          const checkSpelling = await client2.ft.spellCheck(
            `idx:${redisProductSchema}`,
            word
          );
          return checkSpelling[0]?.suggestions[0]?.suggestion ?? word;
        })
      )).filter((w) => w);
      const results = await client2.ft.search(
        `idx:${redisProductSchema}`,
        `@name:(${spellingFixedQuery.join(" ")}) | @description:(${spellingFixedQuery.join(" ")}) `,
        {
          LIMIT: {
            from: 0,
            size: 100
          },
          SCORER: "BM25"
        }
      );
      const tags = results.documents.map((d) => ({
        ...d.value
      })).flatMap((p) => p.tags?.split(",")).filter((p) => p);
      const mostSimilarTags = matchMostSimilarQuery(tags, searchQuery);
      return mostSimilarTags.splice(0, 20);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  async getProductsByCategoryId({
    categoryId,
    page = 1,
    pageSize = 100
  }) {
    try {
      return prisma6.product.findMany({
        where: { categoryId },
        take: pageSize,
        skip: (page - 1) * pageSize
      });
    } catch (e) {
      console.log(e);
      return [];
    }
  }
};

// src/routes/admin-router.ts
var defaultS3Bucket = env.S3_BUCKET;
var symptomDataS3Bucket = env.S3_BUCKET;
var s3 = new clientS3.S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  }
});
var upload = multer({
  storage: multerS3({
    s3,
    bucket: env.S3_BUCKET,
    acl: "public-read",
    metadata: (_, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_, file, cb) => {
      const fileName = `product-image-${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
var userService2 = new UserService();
var categoryService = new CategoryService();
var productService = new ProductService();
var productImageService = new ProductImageService();
var adminRouter = express.Router();
var asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((e) => {
    console.log(e);
    next(e);
  });
};
adminRouter.post(
  "/login",
  asyncHandler(
    async (req, response) => {
      const loginData = req.body;
      const user = await userService2.login(loginData);
      response.send(user);
    }
  )
);
adminRouter.get(
  "/who-iam",
  asyncHandler(async (req, response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      response.status(400).send("Token not found");
    } else {
      const user = await userService2.validateUserByToken(token);
      response.send(user);
    }
  })
);
adminRouter.get(
  "/users/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const users = await userService2.getById(id);
    response.send(users);
  })
);
adminRouter.get(
  "/users/:page/:pageSize",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const users = await userService2.list(page, pageSize);
    response.send(users);
  })
);
adminRouter.post(
  "/users/store",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const userData = req.body;
    const users = await userService2.create(userData);
    response.send(users);
  })
);
adminRouter.post(
  "/users/update/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const userData = req.body;
    const result = await userService2.update(id, userData);
    response.send(result);
  })
);
adminRouter.get(
  "/categories/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const category = await categoryService.getById(id);
    response.send(category);
  })
);
adminRouter.get(
  "/categories/:page/:pageSize",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const category = await categoryService.list(page, pageSize);
    response.send(category);
  })
);
adminRouter.post(
  "/categories/store",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const categoryData = req.body;
    const category = await categoryService.create(categoryData);
    response.send(category);
  })
);
adminRouter.post(
  "/categories/update/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const categoryData = req.body;
    const result = await categoryService.update(id, categoryData);
    response.send(result);
  })
);
adminRouter.get(
  "/products/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    response.send(product);
  })
);
adminRouter.get(
  "/products/:page/:pageSize",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const product = await productService.list(page, pageSize);
    response.send(product);
  })
);
adminRouter.post(
  "/products/store",
  upload.array("images", 10),
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const { name, description, price, quantity, discount, tags, categoryId } = req.body;
    const images = req.files;
    const product = await productService.create({
      name,
      description,
      price,
      quantity,
      discount,
      tags,
      categoryId
    });
    if (product) {
      const imageData = images.map((image) => ({
        url: image.location,
        productId: product.id
      }));
      await productImageService.insertBatch(imageData);
    }
    response.send(product);
  })
);
adminRouter.post(
  "/products/update/:id",
  asyncHandler(adminMiddleware),
  asyncHandler(async (req, response) => {
    const id = Number(req.params.id);
    const productData = req.body;
    const result = await productService.update(id, productData);
    response.send(result);
  })
);
adminRouter.post(
  "/products/upload-image/:productId",
  asyncHandler(adminMiddleware),
  upload.single("file"),
  asyncHandler(async (req, response) => {
    const productId = Number(req.params.productId);
    const file = req.file;
    const image = await productImageService.create({
      productId,
      url: file.location
    });
    response.send(image);
  })
);

// src/routes/router.ts
import express2 from "express";

// src/elastic-search/search.ts
var elasticSearchProductsTags = async (searchQuery) => {
  try {
    const results = await esClient.search({
      index: productTagIndexName,
      body: {
        size: 100,
        // Return only the first 100 results
        query: {
          multi_match: {
            query: searchQuery,
            fields: ["tags"],
            type: "best_fields",
            fuzziness: "AUTO",
            operator: "AND",
            tie_breaker: 0.3,
            minimum_should_match: "75%",
            boost: 2
          }
        }
      }
    });
    const tags = results.hits.hits.map((h) => {
      return h._source ? {
        ...h._source
      } : null;
    }).filter((h) => h).map((h) => h.tags);
    const mostSimilarTags = matchMostSimilarQuery(tags, searchQuery);
    return mostSimilarTags.splice(0, 20);
  } catch (e) {
    console.error(e);
    return [];
  }
};

// src/utils/detect-device.ts
import { DeviceType } from "@ecommerce/database";
function detectDeviceType(userAgent) {
  const mobileRegex = /Mobile|Android|iP(?:hone|od)|IEMobile|BlackBerry|Opera Mini/i;
  const tabletRegex = /Tablet|iPad/i;
  if (mobileRegex.test(userAgent)) {
    return DeviceType.MOBILE;
  } else if (tabletRegex.test(userAgent)) {
    return DeviceType.TABLET;
  }
  return DeviceType.DESKTOP;
}

// src/routes/router.ts
var categoryService2 = new CategoryService();
var productService2 = new ProductService();
var router = express2.Router();
var asyncHandler2 = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
router.get("/", (_, res) => {
  res.send("Hello");
});
router.get(
  "/categories",
  asyncHandler2(async (_, response) => {
    const categories = await categoryService2.list();
    response.send(categories);
  })
);
router.get(
  "/products/search/:query",
  asyncHandler2(async (req, response) => {
    const searchQuery = req.params.query;
    if (!searchQuery) {
      response.send([]);
    } else {
      const deviceType = detectDeviceType(req.headers["user-agent"] ?? "");
      const products = await productService2.searchProducts({
        searchQuery,
        ip: req.ip ?? "",
        deviceType
      });
      response.send(products);
    }
  })
);
router.get(
  "/products/suggestions-elastic/:query",
  asyncHandler2(async (req, response) => {
    const searchQuery = req.params.query;
    if (!searchQuery) {
      response.send([]);
    } else {
      const products = await elasticSearchProductsTags(searchQuery);
      response.send(products);
    }
  })
);
router.get(
  "/products/suggestions-redis/:query",
  asyncHandler2(async (req, response) => {
    const searchQuery = req.params.query;
    if (!searchQuery) {
      response.send([]);
    } else {
      const products = await productService2.searchWithRedisStack(searchQuery);
      response.send(products);
    }
  })
);
router.get(
  "/products/:page/:pageSize",
  asyncHandler2(async (req, response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const products = await productService2.list(page, pageSize);
    response.send(products);
  })
);
router.get(
  "/categories",
  asyncHandler2(async (_, response) => {
    const categories = await categoryService2.list();
    response.send(categories);
  })
);
router.get(
  "/products/:categoryId",
  asyncHandler2(async (req, response) => {
    const categoryId = Number(req.params.categoryId);
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);
    const products = await productService2.getProductsByCategoryId({
      categoryId,
      page,
      pageSize
    });
    response.send(products);
  })
);

// src/index.ts
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise rejection:", err);
});
process.on("uncaughtException", (error) => {
  console.error("uncaughtException error:", error);
});
var filename = fileURLToPath(import.meta.url);
var dirname = path.dirname(filename);
var app = express3();
app.use(cors());
var publicDir = path.join(dirname, "../public");
global.publicDir = publicDir;
app.use(express3.static(publicDir));
var port = env.PORT;
app.use(express3.json());
app.use("/admin", adminRouter);
app.use(router);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map
