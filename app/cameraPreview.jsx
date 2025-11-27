import React, { useEffect, useState } from "react";
import { SafeAreaView, Image, ActivityIndicator, View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { cardDetectionApi } from "@/src/api/card-detection-api";

export default function CameraPreviewScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detect = async () => {
      const result = await cardDetectionApi.detectCards(uri);

      if (result?.statusCode === 200) {
        router.navigate({
          pathname: "/cameraResult",
          params: {
            uri,
            cards: JSON.stringify(result.metadata.cards),
          },
        });
      } else {
        alert("Failed to detect cards");
        router.navigate("/cameraScan");
      }
    };

    detect();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <Image
        source={{ uri }}
        style={{ width: "100%", height: "100%", resizeMode: "contain" }}
      />

      <View
        style={{
          position: "absolute",
          inset: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", marginTop: 10 }}>Detecting cards...</Text>

        <TouchableOpacity
          onPress={() => router.navigate("/cameraScan")}
          style={{ position: "absolute", top: 40, left: 20 }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
