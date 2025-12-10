import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { cardApi } from '@/src/api/card-api';


const DeckCardItem = ({ card, count, onAdd, onRemove, maxCount = 3 }) => {
  return (
    <View style={styles.deckCardItem}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          {card.image_thumb_url ? (
            <Image
              source={{ uri: card.image_normal_url }}
              style={styles.cardImagePlaceholder}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImageText}>No Image</Text>
            </View>
          )}
        </View>

        {count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>×{count}</Text>
          </View>
        )}
      </View>

      {/* <Text style={styles.deckCardName} numberOfLines={1}>
        {card.name}
      </Text> */}

      <View style={styles.cardControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onRemove(card)}
        >
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.controlCount}>{count}</Text>
        <TouchableOpacity
          style={[
            styles.controlButton,
            count >= maxCount && styles.controlButtonDisabled,
          ]}
          onPress={() => count < maxCount && onAdd(card)}
          disabled={count >= maxCount}
        >
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>

        
      </View>
    </View>
  );
};

export default DeckCardItem;

const styles = StyleSheet.create({
  deckCardItem: {
    width: "18%",
    marginBottom: 8,
  },
  cardImageContainer: {
    position: "relative",
    aspectRatio: 0.686,
    marginBottom: 4,
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",

  },
  cardImageText: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
  },
  countBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#F2CC0F",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: "#212121",
    fontSize: 10,
    fontWeight: "700",
  },
  deckCardName: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  cardControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  controlButton: {
    width: 20,
    height: 20,
    backgroundColor: "#F2CC0F",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "#F2CC0F",
  },
  controlButtonText: {
    color: "#212121",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 14,
  },
  controlCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F2CC0F",
    minWidth: 12,
    textAlign: "center",
  },
});
