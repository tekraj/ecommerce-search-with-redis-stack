import type { User } from '@ecommerce/database';

import restClient from './api';

export const listUsers = (page = 1, pageSize = 100): Promise<User[]> => {
  return restClient
    .get<User[]>(`/users/${page}/${pageSize}`)
    .then((response) => response.data);
};

export const getUserById = (id: number): Promise<User> => {
  return restClient.get<User>(`/users/${id}`).then((response) => response.data);
};

export const createNewUser = (data: Partial<User>): Promise<User> => {
  return restClient
    .post<User>(`/users/store`, data)
    .then((response) => response.data);
};

export const updateUser = (id: number, data: Partial<User>): Promise<User> => {
  return restClient
    .post<User>(`/users/update/${id}`, data)
    .then((response) => response.data);
};
