import type { Category } from '@ecommerce/database';

import restClient from './api';

export const listCategories = (
  page = 1,
  pageSize = 100,
): Promise<(Category & { childCategories: Category[] })[]> => {
  return restClient
    .get<
      (Category & { childCategories: Category[] })[]
    >(`/categories/${page}/${pageSize}`)
    .then((response) => response.data);
};

export const getCategoryById = (id: number): Promise<Category> => {
  return restClient
    .get<Category>(`/categories/${id}`)
    .then((response) => response.data);
};

export const createNewCategory = (
  data: Partial<Category>,
): Promise<Category> => {
  return restClient
    .post<Category>(`/categories/store`, data)
    .then((response) => response.data);
};

export const updateCategory = (
  id: number,
  data: Partial<Category>,
): Promise<Category> => {
  return restClient
    .post<Category>(`/categories/update/${id}`, data)
    .then((response) => response.data);
};
