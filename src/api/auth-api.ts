import baseApi, { convertToMetadata } from "../services/base-api";
import { ApiResponse } from "../types/api";
import { LoginResponse, User } from "../types/auth";

export const authApi = {
  // Login user
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
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



  // === Update current user profile ===
  async updateProfile(profileData: {
    avatar?: any;  // Base64 string or file (binary)
    first_name?: any;
    last_name?: any;
    email?: any;
    phone_number?: any;
  }) {
    const response = await baseApi.put('/users/me', profileData);
    const metadata = convertToMetadata(response);
    
    return metadata;
  }
};
