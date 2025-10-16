import baseApi, { convertToMetadata } from "../services/base-api";

export const chatApi = {
  getChatList: async () => {
    const response = await baseApi.get("/chat/list");
    return convertToMetadata(response);
  },

  getChatHistory: async (
    receiverId: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const response = await baseApi.get(
      `/chat/${receiverId}?page=${page}&limit=${limit}`
    );
    return convertToMetadata(response);
  },

  markMessagesAsRead: async (receiverId: string) => {
    const response = await baseApi.patch(`/chat/${receiverId}/read`);
    return convertToMetadata(response);
  },
};
