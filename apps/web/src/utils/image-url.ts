import { REST_API_URL } from '../environments/environment';

export const getImage = (url: string) => {
  return `${REST_API_URL}/${url}`;
};
