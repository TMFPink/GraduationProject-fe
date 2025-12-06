import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import baseApi, { convertToMetadata } from "../services/base-api";

export const postApi = {
    getAllPost: async (limit = 20, page = 1, search = '') => {
        // Build params object
        const params: any = { limit, page };
        
        // Only add search parameter if it's provided
        if (search && search.trim() !== '') {
            params.search = search;
        }
        
        const response = await baseApi.get("/posts", { params });
        return convertToMetadata(response);
    },
// ✅ UPDATED FUNCTION
    createPost: async (postData: any) => {
        // Detect if we are sending FormData (Image upload) or JSON
        const isFormData = postData instanceof FormData;

        const config = isFormData ? {
            headers: { 
                // Explicitly set multipart for FormData
                'Content-Type': 'multipart/form-data',
            },
            // CRITICAL: Prevent Axios from trying to stringify the FormData
            transformRequest: (data: any) => data, 
        } : {};

        // Pass the config as the 3rd argument
        const response = await baseApi.post("/posts", postData, config);
        return convertToMetadata(response);
    },

    deletePost: async (postId: string) => {
        const response = await baseApi.delete(`/posts/${postId}`);
        return convertToMetadata(response);
    },

    getPostById: async (postId: string) => {
        const response = await baseApi.get(`/posts/${postId}`);
        return convertToMetadata(response);
    },

    getPostsByUserId: async (userId: string, limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/posts/user/${userId}`, { params });
        return convertToMetadata(response);
    },  

    upvotePost: async (postId: string) => {
        const response = await baseApi.post(`/posts/${postId}/upvote`);
        return convertToMetadata(response);
    },

    downvotePost: async (postId: string) => {
        const response = await baseApi.post(`/posts/${postId}/downvote`);
        return convertToMetadata(response);
    },  
}