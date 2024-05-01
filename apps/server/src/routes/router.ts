import express from 'express';
import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';

import { CategoryService } from '../services/category-service';
import { ProductService } from '../services/product-service';

const categoryService = new CategoryService();
const productService = new ProductService();
const router: Router = express.Router();
const asyncHandler =
  <T = RequestHandler>(
    fn: (req: Request, res: Response, next: NextFunction) => T,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.get('/', (_, res) => {
  res.send('Hello');
});
router.get(
  '/categories',
  asyncHandler(async (_: Request, response: Response) => {
    const categories = await categoryService.list();
    response.send(categories);
  }),
);
router.get(
  '/products/search/:query',
  asyncHandler(async (req: Request, response: Response) => {
    const searchQuery = req.params.query;
    if (!searchQuery) {
      response.send([]);
    } else {
      const products = await productService.search(searchQuery);
      response.send(products);
    }
  }),
);
router.get(
  '/products/:page/:pageSize',
  asyncHandler(async (req: Request, response: Response) => {
    const page = Number(req.params.page);
    const pageSize = Number(req.params.pageSize);
    const products = await productService.list(page, pageSize);
    response.send(products);
  }),
);

export { router };
