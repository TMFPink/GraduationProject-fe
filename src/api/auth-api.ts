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
  username?: string;
  userTag?: string;
  email?: string;
  phone_number?: string;
  avatar?: string;  // Binary format
  cover?: string;   // Binary format
}) {
  const response = await baseApi.put('/users/me', profileData);
  const metadata = convertToMetadata(response);
  
  // Response structure: { message, metadata: { user_id, username, email, avatar_url, cover_url, ... } }
  return metadata;
}
};
