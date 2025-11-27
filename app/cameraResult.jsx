import React from "react";
import { SafeAreaView, FlatList, Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";


export default function DetectionResultScreen() {
  const router = useRouter();
  const { uri, cards } = useLocalSearchParams();

  const detectedCards = JSON.parse(cards);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
      <TouchableOpacity onPress={() => router.navigate("/cameraPreview") }>
        <Text style={{ fontSize: 18 }}>← Back to Preview</Text>
      </TouchableOpacity>

      {/* Original photo */}
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height: 120,
          borderRadius: 8,
          marginVertical: 12,
          resizeMode: "cover",
        }}
      />

      {/* List of detected cards */}
      <FlatList
        data={detectedCards}
        keyExtractor={(item) => item.card_id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              padding: 12,
              borderWidth: 1,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <Image
              source={{ uri: item.image_thumb_url }}
              style={{ width: 60, height: 60, borderRadius: 4 }}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.name}</Text>
              <Text>{item.rarity}</Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => router.navigate("/cameraScan")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ fontSize: 18, textAlign: "center" }}>📷 Retake</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
