import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const DeckCardItem = ({ card, count, onAdd, onRemove, maxCount = 3 }) => {
  return (
    <View style={styles.deckCardItem}>
      <View style={styles.cardImageContainer}>
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>IMG</Text>
        </View>

        {count > 1 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>×{count}</Text>
          </View>
        )}
      </View>

      <Text style={styles.deckCardName} numberOfLines={1}>
        {card.name}
      </Text>

      <View style={styles.cardControls}>
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

        <Text style={styles.controlCount}>{count}</Text>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => onRemove(card)}
        >
          <Text style={styles.controlButtonText}>−</Text>
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
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
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
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: "white",
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
    backgroundColor: "#2196F3",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButtonDisabled: {
    backgroundColor: "#ccc",
  },
  controlButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 14,
  },
  controlCount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
    minWidth: 12,
    textAlign: "center",
  },
});
