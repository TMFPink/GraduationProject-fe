import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import baseApi, { convertToMetadata } from "../services/base-api";

export const followApi = {
    followToggle: async (followData: any) => {
        const response = await baseApi.post("/follow/toggle", followData);
        return convertToMetadata(response);
    },
    
    getFollowersByUserId: async (userId: string, limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/follow/${userId}/followers`, { params });
        return convertToMetadata(response);
    },
    getFollowingByUserId: async (userId: string, limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/follow/${userId}/following`, { params });
        return convertToMetadata(response);
    },
    
    getMyFollowers: async (limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/follow/me/followers`, { params });
        return convertToMetadata(response);
    },
    getMyFollowing: async (limit = 20, page = 1) => {
        const params: any = { limit, page };
        const response = await baseApi.get(`/follow/me/following`, { params });
        return convertToMetadata(response);
    }
}