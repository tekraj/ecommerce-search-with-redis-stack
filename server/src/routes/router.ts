import express from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
const router = express.Router();
const asyncHandler =
  <T = RequestHandler>(
    fn: (req: Request, res: Response, next: NextFunction) => T
  ) =>
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
router.post(
  '/test', asyncHandler(async (_: Request, response: Response) => {
    response.send('hello');
  }));

export default router;
