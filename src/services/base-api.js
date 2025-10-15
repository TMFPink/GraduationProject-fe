
import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '../utils/auth';

const baseApi = axios.create({
  baseURL: Constants.expoConfig?.extra?.baseUrl || 'http://localhost:3000/v1',
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
