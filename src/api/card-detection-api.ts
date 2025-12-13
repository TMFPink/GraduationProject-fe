import baseApi, { convertToMetadata } from "../services/base-api";

export const cardDetectionApi = {
  async detectCardsTest(imageUri: string, domain: string = "ygo") {
    try {
      const formData = new FormData();
      
      // React Native FormData structure
      formData.append("file", {
        uri: imageUri,
        name: "card_image.jpg",
        type: "image/jpeg",
      } as any);
      
      formData.append("domain", domain);
      
      console.log("📤 Sending card detection request");
      console.log("  - Image URI:", imageUri);
      console.log("  - Domain:", domain);
      
      const response = await baseApi.post("/card-detection/test", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Card detection response:", response);
      return convertToMetadata(response);
    } catch (error: any) {
      console.error("❌ Card Detection API Error:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to detect cards"
      );
    }
  },

  async detectCards(imageUri: string, domain: string = "ygo") {
    try {
      const formData = new FormData();
      
      formData.append("file", {
        uri: imageUri,
        name: "card_image.jpg",
        type: "image/jpeg",
      } as any);
      
      formData.append("domain", domain);
      
      const response = await baseApi.post("/card-detection", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      return convertToMetadata(response);
    } catch (error: any) {
      console.error("❌ API Error:", error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        "Failed to detect cards"
      );
    }
  },

  async getDetectedCards(imageUri: string) {
    const response = await baseApi.post("/card-detection/name", { imageUri });
    return convertToMetadata(response);
  },
};