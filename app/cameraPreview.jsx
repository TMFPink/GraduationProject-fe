import React, { useState } from "react";
import { 
  Image, 
  ActivityIndicator, 
  View, 
  Text, 
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { cardDetectionApi } from "@/src/api/card-detection-api";

export default function CameraPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const imageUri = Array.isArray(params.imageUri) 
    ? params.imageUri[0] 
    : params.imageUri;
  
  const domain = Array.isArray(params.domain) 
    ? params.domain[0] 
    : params.domain || "ygo";

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!imageUri) {
      Alert.alert("Error", "No image to process");
      return;
    }

    setLoading(true);

    try {
      console.log("🔍 Starting card detection...");
      console.log("  - Image URI:", imageUri);
      console.log("  - Domain:", domain);
      
      const result = await cardDetectionApi.detectCardsTest(imageUri, domain);
      
      console.log("✅ Detection successful:", result);

      if (result.statusCode === 200 && result.metadata?.cards) {
        const cards = result.metadata.cards;
        
        // Use replace to remove preview from stack
        router.replace({
          pathname: "/cameraResult",
          params: {
            imageUri: imageUri,
            cardsData: JSON.stringify(cards),
            domain: domain,
          },
        });
      } else {
        throw new Error("No cards detected in the response");
      }
    } catch (error) {
      console.error("❌ Detection error:", error);
      setLoading(false);
      
      Alert.alert(
        "Detection Failed",
        error.message || "Failed to detect cards. Please try again.",
        [
          {
            text: "Retake",
            onPress: () => router.navigate({
              pathname: "/cameraScan",
              params: { domain: domain }
            }
            ),
          },
          {
            text: "Cancel",
            onPress: () => router.navigate("/search"),
            style: "cancel",
          },
        ]
      );
    }
  };

  const handleRetake = () => {
    router.navigate({
      pathname: "/cameraScan",
      params: { domain: domain }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={64} color="#666" />
          <Text style={styles.noImageText}>No image captured</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Detecting cards...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      )}

      {!loading && (
        <>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleRetake}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={handleRetake}
            >
              <Ionicons name="camera-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleConfirm}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  noImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 16,
    fontWeight: "600",
  },
  loadingSubtext: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 30,
    left: 20,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    zIndex: 10,
  },
  actionContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    bottom: 60,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 32,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  retakeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "#fff",
  },
  confirmButton: {
    backgroundColor: "#10B981",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});