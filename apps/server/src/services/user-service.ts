import type { User, Prisma } from '@ecommerce/database';
import {
  UserPartialSchema,
  UserSchema,
  prisma,
  UserIdSchema,
} from '@ecommerce/database';

import { authenticateToken, createJWTToken } from '~/utils/jwt';
import { comparePassword, hashPassword } from '~/utils/password';

export class UserService {
  async list(page = 1, limit = 100) {
    return prisma.user.findMany({
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User | null> {
    try {
      const result = UserSchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      result.password = await hashPassword(result.password);
      return prisma.user.create({ data: result });
    } catch (e) {
      return null;
    }
  }

  async upsert(data: Prisma.UserCreateInput): Promise<User | null> {
    try {
      const result = UserSchema.parse({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      result.password = await hashPassword(result.password);
      return prisma.user.upsert({
        where: { email: result.email },
        create: result,
        update: { updatedAt: new Date() },
      });
    } catch (e) {
      return null;
    }
  }

  async getById(id: number): Promise<User | null> {
    const { id: Id } = UserIdSchema.parse({ id });
    return prisma.user.findUnique({ where: { id: Id } });
  }
  async getByEmail(email: string): Promise<User | null> {
    try {
      const { email: Email } = UserSchema.pick({ email: true }).parse({
        email,
      });
      return prisma.user.findUnique({ where: { email: Email } });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      const result = UserPartialSchema.parse({
        ...data,
        updatedAt: new Date(),
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

  async delete(id: number): Promise<User | null> {
    try {
      const { id: Id } = UserIdSchema.parse({ id });
      const deleteUser = await prisma.user.delete({
        where: { id: Id },
      });
      return deleteUser;
    } catch (error) {
      return null;
    }
  }

  async login({ email, password }: { email: string; password: string }) {
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
  async validateUserByToken(token: string) {
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
}
