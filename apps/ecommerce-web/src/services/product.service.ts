import axios from 'axios';
import { REST_API_URL } from 'src/data/constants';

import type { Product } from '@ecommerce/database';

import { restClient } from './api';

export const listProduct = (page = 1, pageSize = 50): Promise<Product[]> => {
  return axios
    .get<Product[]>(`${REST_API_URL}/products/${page}/${pageSize}`)
    .then((response) => response.data);
};
export const searchProducts = (text: string): Promise<string[]> => {
  return restClient
    .get<string[]>(`/products/search/${text}`)
    .then((response) => response.data);
};
export const elasticSearchProducts = (text: string): Promise<string[]> => {
  return restClient
    .get<string[]>(`/products/search-elastic/${text}`)
    .then((response) => response.data);
};

export const redisSearchProducts = (text: string): Promise<string[]> => {
  return axios
    .get<string[]>(`${REST_API_URL}/products/search-redis/${text}`)
    .then((response) => response.data);
};
