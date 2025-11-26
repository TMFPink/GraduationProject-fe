import baseApi, {convertToMetadata} from "../services/base-api";

export const cardDetectionApi = {
    async detectCards(imageUri:any) {
    const response = await baseApi.post(`/card-detection`, { imageUri });
    return convertToMetadata(response);
    }
};
