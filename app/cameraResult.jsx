import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

export default function CameraResultScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => Colors[colorScheme ?? "light"], [colorScheme]);
  const router = useRouter();
  const params = useLocalSearchParams();

  const imageUri = Array.isArray(params.imageUri)
    ? params.imageUri[0]
    : params.imageUri;

  const domain = Array.isArray(params.domain)
    ? params.domain[0]
    : params.domain || "ygo";

  let detectedCards = [];
  try {
    detectedCards = params.cardsData 
      ? JSON.parse(params.cardsData) 
      : [];
  } catch (error) {
    console.error("Error parsing cards data:", error);
  }

  const handleRetake = () => {
    // Go back to camera scan with domain
    router.replace({
      pathname: "/cameraScan",
      params: { domain: domain }
    });
  };

  const handleDone = () => {
    // Navigate back to search page
    router.navigate("/(tabs)/searchs");
  };

  const handleCardPress = (card) => {
    router.navigate({
      pathname: "/cardDetail",
      params: { card: JSON.stringify(card) },
    });
  };

  const handleAddToCollection = () => {
    Alert.alert(
      "Add to Collection",
      `Add ${detectedCards.length} card(s) to your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: () => {
            // [Inference] You would implement collection add logic here
            console.log("Adding cards to collection:", detectedCards);
            Alert.alert("Success", "Cards added to collection!");
            router.navigate("/(tabs)/searchs");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header
        title={`Detected Cards (${detectedCards.length})`}
        left={{ icon: "arrow-back", onPress: handleDone }}
        right={{ icon: "close", onPress: handleDone }}
        color={theme.text}
      />

      {imageUri && <MiniPreview uri={imageUri} />}

      {detectedCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.icon} />
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No cards detected
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
            Try taking another photo with better lighting
          </Text>
        </View>
      ) : (
        <FlatList
          data={detectedCards}
          keyExtractor={(item) => item.card_id}
          renderItem={({ item }) => (
            <CardItem
              item={item}
              borderColor={theme.borderColor}
              textColor={theme.text}
              secondaryText={theme.secondaryText}
              tint={theme.tint}
              background={theme.background}
              onPress={() => handleCardPress(item)}
            />
          )}
          contentContainerStyle={styles.cardsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.bottomActions, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.background, borderColor: theme.tint },
          ]}
          onPress={handleRetake}
        >
          <Ionicons name="camera-outline" size={22} color={theme.tint} />
          <Text style={[styles.actionBtnText, { color: theme.tint }]}>
            Retake
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.tint, borderColor: theme.tint },
          ]}
          onPress={handleDone}
        >
          <Ionicons name="checkmark" size={22} color="#fff" />
          <Text style={[styles.actionBtnText, { color: "#fff" }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Header({ title, left, right, color = "#fff" }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {left ? (
          <TouchableOpacity onPress={left.onPress} style={styles.headerBtn}>
            <Ionicons name={left.icon} size={24} color={color} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnPlaceholder} />
        )}
      </View>

      <Text style={[styles.headerTitle, { color }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.headerSide}>
        {right ? (
          <TouchableOpacity onPress={right.onPress} style={styles.headerBtn}>
            <Ionicons name={right.icon} size={24} color={color} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnPlaceholder} />
        )}
      </View>
    </View>
  );
}

function MiniPreview({ uri }) {
  return (
    <View style={styles.miniPreview}>
      <Image source={{ uri }} style={styles.miniPreviewImage} />
    </View>
  );
}

function CardItem({ 
  item, 
  borderColor, 
  textColor, 
  secondaryText, 
  tint, 
  background,
  onPress 
}) {
  return (
    <TouchableOpacity 
      style={[styles.cardItem, { backgroundColor: background, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.image_thumb_url || item.image_normal_url }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: textColor }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.cardRarity, { color: secondaryText }]}>
          {item.rarity}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.cardActionButton}
        onPress={onPress}
      >
        <Ionicons name="chevron-forward" size={22} color={tint} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  headerSide: { 
    width: 56, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  headerBtn: { 
    padding: 8, 
    minWidth: 40, 
    alignItems: "center" 
  },
  headerBtnPlaceholder: { 
    width: 40, 
    height: 24 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  miniPreview: {
    height: 120,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniPreviewImage: { 
    width: "100%", 
    height: "100%", 
    resizeMode: "cover" 
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  cardsList: { 
    padding: 16, 
    paddingTop: 0,
    paddingBottom: 120,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardImage: { 
    width: 60, 
    height: 84, 
    borderRadius: 6, 
    resizeMode: "cover" 
  },
  cardInfo: { 
    flex: 1, 
    marginLeft: 12 
  },
  cardName: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 4 
  },
  cardRarity: { 
    fontSize: 14, 
    opacity: 0.7 
  },
  cardActionButton: { 
    padding: 8 
  },
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 32,
    paddingVertical: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 140,
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});