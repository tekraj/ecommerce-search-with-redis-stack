import jwt from 'jsonwebtoken';

import type { User } from '@ecommerce/database';

import { env } from '~/env.mjs';

export const createJWTToken = (user: User) => {
  return jwt.sign({ email: user.email, name: user.name }, env.JWT_SECRET, {
    expiresIn: '1d',
  });
};
export const refreshToken = (user: User) => {
  return jwt.sign(
    { email: user.email, name: user.name },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '1d' },
  );
};
export const authenticateToken = (token: string) => {
  return new Promise<{ email: string }>((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(new Error('Invalid Key'));
      } else {
        resolve(payload as { email: string });
      }
    });
  });
};
