import baseApi, { convertToMetadata } from "../services/base-api";

export const deckApi = {
  // === Get all decks with pagination ===
  getAllDecks: async (page = 1, limit = 20) => {
    const response = await baseApi.get(`/deck?page=${page}&limit=${limit}`);
    return convertToMetadata(response);
  },

  // === Get a single deck by ID ===
  getDeckById: async (deckId: any) => {
    const response = await baseApi.get(`/deck/${deckId}`);
    return convertToMetadata(response);
  },

  // === Create a new deck ===
  async createDeck(deckData: any) {
    const response = await baseApi.post(`/deck`, deckData);
    const metadata = convertToMetadata(response);
    
    // Based on API docs, response structure is:
    // { message, deck: { deck_id, user_id, name, card_type, format, createdAt } }
    return metadata;
  },

  // === Update a deck by ID ===
  async updateDeck(deckId: any, deckData: any) {
    const response = await baseApi.put(`/deck/${deckId}`, deckData);
    const metadata = convertToMetadata(response);
    
    // Response structure: { message, deck: {...} }
    return metadata;
  },

  // === Delete a deck by ID ===
  async deleteDeck(deckId: any) {
    const response = await baseApi.delete(`/deck/${deckId}`);
    return convertToMetadata(response);
  },
};