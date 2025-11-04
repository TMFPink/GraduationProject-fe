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
    createPost: async (postData: any) => {
        const response = await baseApi.post("/posts", postData);
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
        const response = await baseApi.get(`/users/${userId}/posts`, { params });
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