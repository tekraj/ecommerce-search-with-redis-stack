import type { Category, Product, ProductImage } from '@ecommerce/database';

import restClient from './api';

export const listProducts = (
  page = 1,
  pageSize = 100,
): Promise<{
  data: (Product & { category: Category })[];
  hasMore: boolean;
}> => {
  return restClient
    .get<{
      data: (Product & { category: Category })[];
      hasMore: boolean;
    }>(`/products/${page}/${pageSize}`)
    .then((response) => response.data);
};

export const getProductById = (
  id: number,
): Promise<Product & { images: ProductImage[] }> => {
  return restClient
    .get<Product & { images: ProductImage[] }>(`/products/${id}`)
    .then((response) => response.data);
};

export const createNewProduct = (data: FormData): Promise<Product> => {
  return restClient
    .post<Product>(`/products/store`, data)
    .then((response) => response.data);
};

export const updateProduct = (
  id: number,
  data: Partial<Product>,
): Promise<Product> => {
  return restClient
    .post<Product>(`/products/update/${id}`, data)
    .then((response) => response.data);
};

export const uploadImage = (
  productId: number,
  formData: FormData,
): Promise<ProductImage> => {
  console.log(formData);
  return restClient
    .post<ProductImage>(`/products/upload-image/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => response.data);
};

export const deleteImage = (imageId: number): Promise<ProductImage> => {
  return restClient
    .get<ProductImage>(`/products/delete-image/${imageId}`)
    .then((response) => response.data);
};
