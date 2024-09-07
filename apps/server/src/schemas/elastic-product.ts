import { z } from 'zod';

const searchPropertySchema = z.string().min(1, 'Text is required');

export const elasticProductSchema = z.object({
  id: z.number().int(),
  name: searchPropertySchema,
  url: z.string().url(),
  description: searchPropertySchema,
  price: z.number().positive(),
  quantity: z.number().int(),
  discount: z.number().optional(),
  tags: z.string().array(),
  categoryId: z.number().int(),
  categoryName: z.string(),
  images: z.array(
    z.object({
      url: z.string().url(),
      description: searchPropertySchema,
    }),
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ElasticProduct = z.infer<typeof elasticProductSchema>;
