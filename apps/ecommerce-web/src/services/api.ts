import axios from 'axios';

const restAPIBaseURL = process.env.REACT_APP_REST_API_BASE_URL;
export const restClient = axios.create({
  baseURL: restAPIBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const getImageURL = (image: string) => {
  return `${process.env.REACT_APP_REST_API_BASE_URL}/images/${image}`;
};
