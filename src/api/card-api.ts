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
        const response = await baseApi.get("/cards", {
            params: { search: name, limit: 1000 }
        });
        return convertToMetadata(response);
    },

    getMetadataCard: async (
    limit: number = 20,
    page: number = 1,
    search: string = '',
    filters: {
        atk?: number;
        def?: number;
        race?: string;
        type?: string;
        level?: number;
        archetype?: string;
        attribute?: string;
        banlist_info?: string;
        genesys_points?: number;
    } = {}
    ) => {
    // Base parameters
    const params: Record<string, string | number> = {
        limit,
        page,
        domain: 'ygo',
    };

    // Add search if present
    if (search.trim() !== '') {
        params.name = search; // ✅ Backend expects 'name'
    }

    // Add filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
        }
    });

    // Fetch data
    const response = await baseApi.get('/cards/meta-data', { params });
    return convertToMetadata(response);
    },


    // ✅ NEW: Get single card by ID
    getCardById: async (cardId: string) => {
        const response = await baseApi.get(`/cards/${cardId}`);
        return convertToMetadata(response);
    },
}