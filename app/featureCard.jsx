import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ownedCardApi } from "@/src/api/ownedcard-api";

const FeaturedCardSelection = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [ownedCards, setOwnedCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]); // Array of { owned_card_id, position }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch owned cards
  const fetchOwnedCards = async () => {
    try {
      setLoading(true);
      const response = await ownedCardApi.getAllOwnedCards(1, 100);
      const ownedCardsData = response.metadata?.ownedCards || [];
      setOwnedCards(ownedCardsData);
    } catch (error) {
      console.error("Failed to fetch owned cards:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current featured cards
  const fetchFeaturedCards = async () => {
    try {
      const response = await ownedCardApi.getFeaturedCards();
      const featured = response.metadata?.featureCards || [];
      
      // Transform to selectedCards format
      const selected = featured.map((fc) => ({
        owned_card_id: fc.owned_card_id,
        position: fc.position,
      }));
      
      setSelectedCards(selected);
    } catch (error) {
      console.error("Failed to fetch featured cards:", error);
    }
  };

  useEffect(() => {
    fetchOwnedCards();
    fetchFeaturedCards();
  }, []);

  // Toggle card selection
  const toggleCardSelection = (ownedCard) => {
    const ownedCardId = ownedCard.owned_card_id;
    const isSelected = selectedCards.some(
      (sc) => sc.owned_card_id === ownedCardId
    );

    if (isSelected) {
      // Deselect
      setSelectedCards((prev) =>
        prev.filter((sc) => sc.owned_card_id !== ownedCardId)
      );
    } else {
      // Select (max 3)
      if (selectedCards.length >= 3) {
        Alert.alert("Limit Reached", "You can only select up to 3 featured cards.");
        return;
      }

      const newPosition = selectedCards.length + 1;
      setSelectedCards((prev) => [
        ...prev,
        { owned_card_id: ownedCardId, position: newPosition },
      ]);
    }
  };

  // Get position of selected card
  const getCardPosition = (ownedCardId) => {
    const selected = selectedCards.find((sc) => sc.owned_card_id === ownedCardId);
    return selected ? selected.position : null;
  };

  // Save featured cards
  const handleSave = async () => {
    try {
      setSaving(true);

      // Reorder positions to be sequential (1, 2, 3)
      const reorderedCards = selectedCards.map((sc, index) => ({
        owned_card_id: sc.owned_card_id,
        position: index + 1,
      }));

      await ownedCardApi.updateFeatureCards(reorderedCards);

      Alert.alert("Success", "Featured cards updated!");
      router.back();
    } catch (error) {
      console.error("Failed to save featured cards:", error);
      Alert.alert("Error", "Failed to save featured cards.");
    } finally {
      setSaving(false);
    }
  };

  // Filter owned cards by search
  const filteredCards = ownedCards.filter((ownedCard) => {
    const card = ownedCard.Card;
    return card && card.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Featured Cards</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search cards..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>
            Save ({selectedCards.length}/3)
          </Text>
        )}
      </TouchableOpacity>

      {/* Card Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B0000" />
          </View>
        ) : filteredCards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? `No cards found for "${searchQuery}"` : "No owned cards yet"}
            </Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {filteredCards.map((ownedCard, index) => {
              const card = ownedCard.Card;
              const position = getCardPosition(ownedCard.owned_card_id);
              const isSelected = position !== null;

              return (
                <TouchableOpacity
                  key={`${card.card_id}-${index}`}
                  style={styles.cardItem}
                  onPress={() => toggleCardSelection(ownedCard)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.cardImageContainer,
                      isSelected && styles.selectedCardBorder,
                    ]}
                  >
                    <Image
                      source={{ uri: card.image_normal_url || card.image_small_url }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />

                    {/* Selection Badge */}
                    {isSelected && (
                      <View style={styles.selectionBadge}>
                        <Text style={styles.selectionBadgeText}>{position}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FeaturedCardSelection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 60,
  },
  backText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fafafa",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1a1a1a",
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9E9E9E",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardItem: {
    width: "20%", // 5 columns
    padding: 4,
  },
  cardImageContainer: {
    aspectRatio: 0.686,
    borderRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    position: "relative",
  },
  selectedCardBorder: {
    borderColor: "#4CAF50",
    borderWidth: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  selectionBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
});