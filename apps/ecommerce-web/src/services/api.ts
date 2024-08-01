import axios from 'axios';

const restAPIBaseURL = process.env.REACT_APP_REST_API_BASE_URL;
export const restClient = axios.create({
  baseURL: restAPIBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});
