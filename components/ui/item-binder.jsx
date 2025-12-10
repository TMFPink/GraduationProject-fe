import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const BinderCard = ({ image, name, setName, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={{ uri: image }} style={styles.cardImage} resizeMode="contain" />
      <View style={styles.cardContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.setName}>Set: {setName}</Text>
        <View style={styles.bottomRow}>
          {/* <Text style={styles.qtyText}>Qty: {qty}</Text>
          <Text style={styles.priceText}>${price}</Text> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BinderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#212121",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    margin: 0,
    width: 150,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#F2CC0F",
  },
  cardImage: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 10,
    alignSelf: "center",
    height: 200,
  },
  cardContent: {
    padding: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F2CC0F",
    marginBottom: 2,
  },
  setName: {
    fontSize: 12,
    color: "#F2CC0F",
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 12,
    color: "#F2CC0F",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F2CC0F",
  },
});