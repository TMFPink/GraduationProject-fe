import baseApi, { convertToMetadata } from "../services/base-api";

export const cardApi = {
    getAllCards: async (limit = 20, page = 1, search = '') => {
        // Build params object
        const params: any = { limit, page };
        
        // Only add search parameter if it's provided
        if (search && search.trim() !== '') {
            params.search = search;
        }
        
        const response = await baseApi.get("/cards", { params });
        return convertToMetadata(response);
    },
    
    // Keep this for backward compatibility if needed elsewhere
    searchCardsByName: async (name: string) => {
        const response = await baseApi.get("/cards/meta-data", {
            params: { search: name, limit: 1000 }
        });
        return convertToMetadata(response);
    },

    getMetadataCard: async (limit = 20, page = 1, search = '') => {
        // Build params object
        const params: any = { limit, page };
        
        // Only add search parameter if it's provided
        if (search && search.trim() !== '') {
            params.search = search;
        }
        
        const response = await baseApi.get("/cards/meta-data", { params });
        return convertToMetadata(response);
    },

    // ✅ NEW: Get single card by ID
    getCardById: async (cardId: string) => {
        const response = await baseApi.get(`/cards/${cardId}`);
        return convertToMetadata(response);
    },
}