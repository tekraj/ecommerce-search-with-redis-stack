import { z } from 'zod';

export const elasticProductTagSchema = z.object({
  frequency: z.number(),
  tags: z.string(),
  createdAt: z.date(),
});

export type ElasticProductTag = z.infer<typeof elasticProductTagSchema>;
