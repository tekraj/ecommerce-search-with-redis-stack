import axios from 'axios';
import { REST_API_URL } from 'src/data/constants';
import type { ProductWithImages } from 'src/types';

import type { Category } from '@ecommerce/database';

import { restClient } from './api';

export const listProduct = (
  page = 1,
  pageSize = 50,
): Promise<{ data: ProductWithImages[] }> => {
  return axios
    .get<{
      data: ProductWithImages[];
    }>(`${REST_API_URL}/products/${page}/${pageSize}`)
    .then((response) => response.data);
};
export const searchProducts = (text: string): Promise<ProductWithImages[]> => {
  return restClient
    .get<ProductWithImages[]>(`/products/search/${text}`)
    .then((response) => response.data);
};
export const searchSuggestions = (text: string): Promise<string[]> => {
  return restClient
    .get<string[]>(`/products/suggestions-elastic/${text}`)
    .then((response) => response.data);
};

export const searchSuggestionsRedis = (text: string): Promise<string[]> => {
  return axios
    .get<string[]>(`${REST_API_URL}/products/suggestions-redis/${text}`)
    .then((response) => response.data);
};

export const saveNewKeyword = (keyword: string): Promise<boolean> => {
  return axios
    .post<boolean>(`${REST_API_URL}/products/save-new-keyword`, { keyword })
    .then((response) => response.data);
};

export const listCategories = (): Promise<
  (Category & { childCategories: Category[] })[]
> => {
  return axios
    .get<
      (Category & { childCategories: Category[] })[]
    >(`${REST_API_URL}/categories`)
    .then((response) => response.data);
};

export const getProductByCategoryId = ({
  page,
  pageSize,
  categoryId,
}: {
  page: number;
  pageSize: number;
  categoryId: number;
}): Promise<ProductWithImages[]> => {
  return axios
    .get<
      ProductWithImages[]
    >(`${REST_API_URL}/products/${categoryId}?page=${page}&pageSize=${pageSize}`)
    .then((response) => response.data);
};
