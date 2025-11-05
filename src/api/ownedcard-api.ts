import baseApi, { convertToMetadata } from "../services/base-api";
export const ownedCardApi = {
  // === Get all collections with pagination ===
  getAllOwnedCards: async (page = 1, limit = 20) => {
    const response = await baseApi.get(`/owned-cards?page=${page}&limit=${limit}`);
    return convertToMetadata(response);
  },
  addOwnedCards: async (card_id: any, card_domain_id: any) => {
    const response = await baseApi.post(`/owned-cards`, { card_id, card_domain_id: "11111111-1111-1111-1111-111111111111"});
    return convertToMetadata(response);
  },
  getAllOwned: async (card_id: any) => {
    const response = await baseApi.delete(`/owned-cards/${card_id}`);
    return convertToMetadata(response);
  }, 
}