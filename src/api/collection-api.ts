import baseApi, { convertToMetadata } from "../services/base-api";


export const collectionApi = {
    
  // === Get all decks with pagination ===
  getAllCollection: async (page = 1, limit = 20) => {
    const response = await baseApi.get(`/collections?page=${page}&limit=${limit}`);
    return convertToMetadata(response);
  },

  // === Get a single deck by ID ===
  getCollectionById: async (collection_id: any) => {
    const response = await baseApi.get(`/collections/${collection_id}`);
    return convertToMetadata(response);
  },

  // === Create a new deck ===
  async createCollection(collectionData: any) {
    const response = await baseApi.post(`/collections`, collectionData);
    const metadata = convertToMetadata(response);
    
    // Based on API docs, response structure is:
    // { message, deck: { deck_id, user_id, name, card_type, format, createdAt } }
    return metadata;
  },

  // === Update a deck by ID ===
  async updateCollection(collection_id: any, collectionData: any) {
    const response = await baseApi.put(`/collections/${collection_id}`, collectionData);
    const metadata = convertToMetadata(response);
    
    // Response structure: { message, deck: {...} }
    return metadata;
  },

  // === Delete a deck by ID ===
  async deleteCollection(collection_id: any) {
    const response = await baseApi.delete(`/collections/${collection_id}`);
    return convertToMetadata(response);
  },

  async addCardToCollection(collection_id: any, cardData: any) {
    const response = await baseApi.post(`/collections/${collection_id}/cards`, cardData);
    return convertToMetadata(response);
  },

};