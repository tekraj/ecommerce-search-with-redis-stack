import axios from 'axios';

import type { User } from '@ecommerce/database';

import restClient, { restAPIBaseURL } from './api';

const authClient = axios.create({
  baseURL: restAPIBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User & { token: string }> => {
  return authClient
    .post<User & { token: string }>(`/login`, { email, password })
    .then((response) => response.data);
};

export const logout = ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<User & { token: string }> => {
  return authClient
    .post<User & { token: string }>(`/login`, { email, password })
    .then((response) => response.data);
};

export const whoIAm = (): Promise<User & { token: string }> => {
  return restClient
    .get<User & { token: string }>('/who-iam')
    .then((response) => response.data);
};
