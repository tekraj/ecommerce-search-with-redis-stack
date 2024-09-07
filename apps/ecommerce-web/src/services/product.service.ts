import axios from 'axios';
import { REST_API_URL } from 'src/data/constants';

import type { Product } from '@ecommerce/database';

import { restClient } from './api';

export const listProduct = (page = 1, pageSize = 50): Promise<Product[]> => {
  return axios
    .get<Product[]>(`${REST_API_URL}/products/${page}/${pageSize}`)
    .then((response) => response.data);
};
export const searchProducts = (text: string): Promise<Product[]> => {
  return restClient
    .get<Product[]>(`/products/search/${text}`)
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
