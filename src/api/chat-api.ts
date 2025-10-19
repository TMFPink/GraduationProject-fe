import baseApi, { convertToMetadata } from "../services/base-api";
import { ApiResponse } from "../types/api";
import { ChatSummary, Message } from "../types/chat";

export const chatApi = {
  getChatList: async (): Promise<ApiResponse<ChatSummary[]>> => {
    const response = await baseApi.get("/chat/list");
    return convertToMetadata(response);
  },

  getChatHistory: async (
    receiverId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<Message[]>> => {
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
