import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import baseApi, { convertToMetadata } from "../services/base-api";

export const commentApi = {
    createComment: async (commentData: any) => {
        const response = await baseApi.post("/comments", commentData);
        return convertToMetadata(response);
    },

    deleteComment: async (commentId: string) => {
        const response = await baseApi.delete(`/comments/${commentId}`);
        return convertToMetadata(response);
    },

    getCommentById: async (commentId: string) => {
        const response = await baseApi.get(`/posts/${commentId}`);
        return convertToMetadata(response);
    },

    getCommentByPostId: async (postId: string, limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/comments/post/${postId}`, { params });
        return convertToMetadata(response);
    } ,

    upvoteComment: async (commentId: string) => {
        const response = await baseApi.post(`/comments/${commentId}/upvote`);
        return convertToMetadata(response);
    },

    downvoteComment: async (commentId: string) => {
        const response = await baseApi.post(`/comments/${commentId}/downvote`);
        return convertToMetadata(response);
    },  
}