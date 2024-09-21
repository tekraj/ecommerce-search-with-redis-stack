import type { Product, ProductImage } from '@ecommerce/database';

export type ProductWithImages = Product & { images: ProductImage[] };
