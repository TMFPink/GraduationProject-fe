import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { getToken } from "../utils/auth";

const baseApi = axios.create({
  baseURL: Constants.expoConfig?.extra?.baseUrl || "http://localhost:3000/v1",
  timeout: 10000,
  headers: {
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// === Request Interceptor ===
baseApi.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// === Response Interceptor ===
baseApi.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // handle token expired, redirect to login
    }
    return Promise.reject(error);
  }
);

// base-api.ts (add this after your interceptors)
export const convertToMetadata = (response: any) => {
  if (response?.statusCode && response?.metadata)
    return {
      statusCode: response.statusCode,
      metadata: response.metadata,
    };

  return {
    statusCode: 500,
    metadata: null,
  };
};

export default baseApi;
