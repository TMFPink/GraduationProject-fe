import baseApi, { convertToMetadata } from "../services/base-api";

export const chatApi = {
  getChatList: async () => {
    const response = await baseApi.get("/chat/list");
    return convertToMetadata(response);
  },

  getChatHistory: async (receiverId: string) => {
    const response = await baseApi.get(`/chat/${receiverId}`);
    return convertToMetadata(response);
  },

  markMessagesAsRead: async (receiverId: string) => {
    const response = await baseApi.patch(`/chat/${receiverId}/read`);
    return convertToMetadata(response);
  },
};
