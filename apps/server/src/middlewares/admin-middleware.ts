import type { Request, Response } from 'express';

import type { User } from '@ecommerce/database';

import { UserService } from '~/services/user-service';
import { authenticateToken } from '~/utils/jwt';

const userService = new UserService();
export const adminMiddleware = async (
  req: Request & { user?: User }, // Extend the request object to include 'user'
  res: Response,
  next: () => void,
) => {
  try {
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.split(' ')[1];

    if (!authToken) {
      res.status(401).send('Unauthorized: Missing Authorization Header');
      return;
    }

    const { email } = await authenticateToken(authToken);
    const user = await userService.getByEmail(email);

    if (!user) {
      res.status(403).send('Forbidden: Invalid Token');
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(403).send('Forbidden: Invalid Token');
  }
};
