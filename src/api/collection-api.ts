import baseApi, { convertToMetadata } from "../services/base-api";
export const collectionApi = {
    
  // === Get all collections with pagination ===
  getAllCollection: async (page = 1, limit = 20) => {
    const response = await baseApi.get(`/collections?page=${page}&limit=${limit}`);
    return convertToMetadata(response);
  },
  // === Get a single collection by ID ===
  getCollectionById: async (collection_id: any) => {
    const response = await baseApi.get(`/collections/${collection_id}`);
    return convertToMetadata(response);
  },
  // === Create a new collection (binder) ===
  async createCollection(collectionData: any) {
    const response = await baseApi.post(`/collections`, collectionData);
    const metadata = convertToMetadata(response);
    
    // Response structure: { message, collection: { collection_id, user_id, name, card_type, createdAt } }
    return metadata;
  },
  // === Update a collection by ID ===
  async updateCollection(collection_id: any, collectionData: any) {
    const response = await baseApi.put(`/collections/${collection_id}`, collectionData);
    const metadata = convertToMetadata(response);
    
    // Response structure: { message, collection: {...} }
    return metadata;
  },
  // === Delete a collection by ID ===
  async deleteCollection(collection_id: any) {
    const response = await baseApi.delete(`/collections/${collection_id}`);
    return convertToMetadata(response);
  },
  // === Add card to collection ===
  async addCardToCollection(collection_id: any, cardData: any) {
    const response = await baseApi.post(`/collections/${collection_id}/cards`, cardData);
    return convertToMetadata(response);
  },

async getCollectionByUserId(user_id: any, page = 1, limit = 20) {
    const response = await baseApi.get(`/collections/user?user_id=${user_id}&page=${page}&limit=${limit}`);
    return convertToMetadata(response);
}
};