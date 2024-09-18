import * as clientS3 from '@aws-sdk/client-s3';
import express from 'express';
import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

import type { Prisma, User } from '@ecommerce/database';

import { env } from '~/env.mjs';
import { adminMiddleware } from '~/middlewares/admin-middleware';
import { CategoryService } from '~/services/category-service';
import { ProductImageService } from '~/services/product-image-service';
import { ProductService } from '~/services/product-service';
import { UserService } from '~/services/user-service';

export const defaultS3Bucket = env.S3_BUCKET;
export const symptomDataS3Bucket = env.S3_BUCKET;
export const s3 = new clientS3.S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});
const upload = multer({
  storage: multerS3({
    s3,
    bucket: env.S3_BUCKET,
    acl: 'public-read',
    metadata: (_, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_, file, cb) => {
      const fileName = `product-image-${Date.now().toString()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
const userService = new UserService();
const categoryService = new CategoryService();
const productService = new ProductService();
const productImageService = new ProductImageService();
const adminRouter: Router = express.Router();
const asyncHandler =
  <T = RequestHandler>(
    fn: (req: Request, res: Response, next: NextFunction) => T,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((e) => {
      console.log(e);
      next(e);
    });
  };

adminRouter.post(
  '/login',
  asyncHandler(
    async (
      req: Request<object, object, { email: string; password: string }>,
      response: Response,
    ) => {
      const loginData = req.body;
      const user = await userService.login(loginData);
      response.send(user);
    },
  ),
);

adminRouter.get(
  '/who-iam',
  asyncHandler(async (req: Request, response: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
      response.status(400).send('Token not found');
    } else {
      const user = await userService.validateUserByToken(token);
      response.send(user);
    }
  }),
);

// user routes
adminRouter.get(
  '/users/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const users = await userService.getById(id);
    response.send(users);
  }),
);
adminRouter.get(
  '/users/:page/:pageSize',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const users = await userService.list(page, pageSize);
    response.send(users);
  }),
);

adminRouter.post(
  '/users/store',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const userData = req.body as Prisma.UserCreateInput;
    const users = await userService.create(userData);
    response.send(users);
  }),
);
adminRouter.post(
  '/users/update/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const userData = req.body as Partial<User>;
    const result = await userService.update(id, userData);
    response.send(result);
  }),
);

// category
adminRouter.get(
  '/categories/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const category = await categoryService.getById(id);
    response.send(category);
  }),
);
adminRouter.get(
  '/categories/:page/:pageSize',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const category = await categoryService.list(page, pageSize);
    response.send(category);
  }),
);

adminRouter.post(
  '/categories/store',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const categoryData = req.body as Prisma.CategoryCreateInput;
    const category = await categoryService.create(categoryData);
    response.send(category);
  }),
);
adminRouter.post(
  '/categories/update/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const categoryData = req.body as Partial<User>;
    const result = await categoryService.update(id, categoryData);
    response.send(result);
  }),
);

// product routes
adminRouter.get(
  '/products/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    response.send(product);
  }),
);
adminRouter.get(
  '/products/:page/:pageSize',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const product = await productService.list(page, pageSize);
    response.send(product);
  }),
);

adminRouter.post(
  '/products/store',
  upload.array('images', 10),
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const { name, description, price, quantity, discount, tags, categoryId } =
      req.body as Prisma.ProductCreateInput & { categoryId: number };
    const images = req.files as Express.MulterS3.File[];

    const product = await productService.create({
      name,
      description,
      price,
      quantity,
      discount,
      tags,
      categoryId,
    });
    if (product) {
      const imageData = images.map((image) => ({
        url: image.location,
        productId: product.id,
      }));
      await productImageService.insertBatch(imageData);
    }

    response.send(product);
  }),
);
adminRouter.post(
  '/products/update/:id',
  asyncHandler(adminMiddleware),
  asyncHandler(async (req: Request, response: Response) => {
    const id = Number(req.params.id);
    const productData = req.body as Partial<User>;
    const result = await productService.update(id, productData);
    response.send(result);
  }),
);

adminRouter.post(
  '/products/upload-image/:productId',
  asyncHandler(adminMiddleware),
  upload.single('file'),
  asyncHandler(async (req: Request, response: Response) => {
    const productId = Number(req.params.productId);
    const file = req.file as Express.MulterS3.File;
    const image = await productImageService.create({
      productId,
      url: file.location,
    });
    response.send(image);
  }),
);
export { adminRouter };
