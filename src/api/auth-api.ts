import baseApi, { convertToMetadata } from "../services/base-api";
import { ApiResponse } from "../types/api";
import { User } from "../types/auth";

export const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    const response = await baseApi.post("/auth/login", { email, password });
    return convertToMetadata(response);
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await baseApi.get("/users/me");
    console.log("getCurrentUser response:", response);
    return convertToMetadata(response);
  },

  // Get user details by ID
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await baseApi.get<ApiResponse<User>>(`/users/${id}`);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await baseApi.get<ApiResponse<User[]>>("/users");
    return response.data;
  },
};
