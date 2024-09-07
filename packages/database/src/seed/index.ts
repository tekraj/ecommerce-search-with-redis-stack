/* eslint-disable no-await-in-loop -- using promise/ will have issue with memory so use for loop */
import csv from 'csv-parser';
import fs from 'node:fs';
import path from 'node:path';
import slug from 'slug';

import type { Prisma } from '..';
import { prisma } from '..';

type CSVFormat = {
  name: string;
  main_category: string;
  sub_category: string;
  image: string;
  link: string;
  ratings: number;
  no_of_ratings: number;
  discount_price: number;
  actual_price: string;
};
const dataDir = process.env.DATA_DIR ?? 'data';
export const readProductCSV = async (
  filePath: string,
  categoryId: number,
): Promise<Prisma.ProductCreateInput[]> => {
  const csvData: Prisma.ProductCreateInput[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVFormat) => {
        if (data.name) {
          csvData.push({
            name: data.name,
            description: data.name,
            price: Number(data.actual_price.replace(/\D/g, '')),
            url: slug(data.name),
            category: { connect: { id: categoryId } },
            quantity: 1000,
          });
        }
      })
      .on('end', () => {
        resolve(filePath);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
  return csvData;
};

export const seedCategoryProducts = async () => {
  const categories = fs.readdirSync(dataDir);
  const allSavedCategories = await Promise.all(
    categories.map(async (category) => {
      const name = category.replace('.csv', '');
      const url = slug(name);
      return prisma.category.upsert({
        where: { url },
        create: { name, url },
        update: { updatedAt: new Date() },
      });
    }),
  );

  //
  for (const category of allSavedCategories) {
    const products = await readProductCSV(
      path.join(dataDir, `${category.name}.csv`),
      category.id,
    );
    for (const product of products) {
      await prisma.product.upsert({
        where: { url: product.url },
        create: product,
        update: { updatedAt: new Date() },
      });
    }
  }
  process.exit(0);
};

seedCategoryProducts()
  .then((data) => {
    console.log(data);
  })
  .catch((e) => {
    console.log(e);
  });
