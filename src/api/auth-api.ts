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
getUserById: async (id:any) => {
  const response = await baseApi.get(`/users/${id}`);
  return convertToMetadata(response);  // ✅ Correct - consistent with other APIs
},

  // Get all users (admin only)
  getAllUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await baseApi.get<ApiResponse<User[]>>("/users");
    return response.data;
  },



  // === Update current user profile ==

updateProfile: async (profileData: FormData | {
    username?: string;
    userTag?: string;
    email?: string;
    phone_number?: string;
    avatar?: string;  
    cover?: string;   
  }) => {
    const isFormData = profileData instanceof FormData;
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data: any) => data,
    } : {};
    const response = await baseApi.put("/users/me", profileData, config);   
    return convertToMetadata(response);
  },
};
