import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CardListItem = ({ image, name, setName, rarity, cardNumber }) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.cardName}>{name}</Text>
        <Text style={styles.cardSet}>{setName}</Text>
        <Text style={styles.cardRarity}>{rarity}</Text>
        <Text style={styles.cardNumber}>{cardNumber}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardImage: {
    width: 90,
    height: 130,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardSet: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  cardRarity: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
});

export default CardListItem;
