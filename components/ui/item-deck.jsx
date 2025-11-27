// components/ui/item-deck.jsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';

const ItemDeck = ({ name, image, isCreateNew, onPress, onDelete, isEditMode }) => {
  const placeholder =
    'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg';

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={styles.innerCard}>
        <View style={styles.imageContainer}>
          {isCreateNew ? (
            <View style={styles.createDeckIcon}>
              <View style={styles.plusIconCircle}>
                <Text style={styles.plusIcon}>+</Text>
              </View>
            </View>
          ) : (
            <Image
              source={{ uri: image || placeholder }}
              style={styles.deckImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        <Text style={styles.deckName} numberOfLines={2}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 130,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
    marginHorizontal: 6,
  },
  innerCard: {
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
    overflow: 'hidden',
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    marginBottom: 8,
  },
  createDeckIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  plusIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 36,
    fontWeight: '400',
    color: '#1a1a1a',
    marginTop: -3,
  },
  deckImage: {
    width: '100%',
    height: '100%',
  },
  deckName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1a1a1a',
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default ItemDeck;