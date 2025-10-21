import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CardGridItem = ({ card }) => {
  const { image, name, setName, rarity, number } = card;

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{setName}</Text>
      <Text style={styles.cardSubtitle}>{rarity}</Text>
      <Text style={styles.cardSubtitle}>{number}</Text>
    </TouchableOpacity>
  );
};

export default CardGridItem;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    width: 160,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    margin: 8,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
  },
});
