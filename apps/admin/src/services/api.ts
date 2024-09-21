import axios from 'axios';

export const restAPIBaseURL = `${process.env.REACT_APP_REST_API_BASE_URL}/admin`;
export const restClient = axios.create({
  baseURL: restAPIBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

restClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error as Error),
);
export const getImageURL = (image: string) => {
  return `${process.env.REACT_APP_REST_API_BASE_URL}/images/${image}`;
};
export default restClient;
