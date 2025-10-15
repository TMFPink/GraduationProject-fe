
import { BASE_URL } from '@env';
import axios from 'axios';
import { getToken } from '../utils/auth';

const baseApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// === Request Interceptor ===
baseApi.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor ===
baseApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // handle token expired, redirect to login
    }
    return Promise.reject(error);
  }
);

export default baseApi;
