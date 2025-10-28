import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CardDetailPage() {
  const cardData = {
    name: 'Meowscarada EX',
    rarity: 'Special Illustration Rare',
    code: '69/420 · Paldea Evolved',
    cardText: 'You must discard a Basic E Energy card from your hand in order to use this Ability. Once during your turn, you may put 3 damage counter on 1 of your opponent\'s Benched Pokémon.',
    prices: [
      { platform: 'TCGPlayer', price: 39.99 },
      { platform: 'CardMarket', price: 39.99 },
      { platform: 'eBay', price: 39.99 },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://tcgplayer-cdn.tcgplayer.com/product/497675_in_1000x1000.jpg' }}
            style={styles.cardImage}
            resizeMode="contain"
          />
        </View>

        {/* Card Information */}
        <View style={styles.contentContainer}>
          <Text style={styles.cardName}>{cardData.name}</Text>
          <Text style={styles.rarity}>{cardData.rarity}</Text>
          <Text style={styles.code}>{cardData.code}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Text:</Text>
            <Text style={styles.cardText}>{cardData.cardText}</Text>
          </View>

          {/* Prices */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prices:</Text>
            <View style={styles.pricesContainer}>
              {cardData.prices.map((item, index) => (
                <View key={index} style={styles.priceCard}>
                  <View style={styles.priceIcon}>
                    <Text style={styles.priceIconText}>$</Text>
                  </View>
                  <Text style={styles.priceAmount}>${item.price}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Decks Related */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Decks related to this card</Text>
            <View style={styles.deckCard}>
              <Image
                source={{ uri: 'YOUR_CARD_IMAGE_URL' }}
                style={styles.deckThumbnail}
              />
              <View style={styles.deckInfo}>
                <Text style={styles.deckName}>Meowscarada EX</Text>
                <Text style={styles.deckMeta}>Paldea Evolved</Text>
                <Text style={styles.deckMeta}>Special Illustration Rare</Text>
                <Text style={styles.deckMeta}>$39.99</Text>
              </View>
            </View>
          </View>


        </View>
      </ScrollView>

      {/* Fixed Add to Collection Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add to Collection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed button
  },
  imageContainer: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
  },
  cardImage: {
    width: SCREEN_WIDTH - 48,
    height: 400,
    borderRadius: 12,
  },
  contentContainer: {
    backgroundColor: '#fff',
    padding: 24,
  },
  cardName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  rarity: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  code: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  pricesContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  priceIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  priceIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  deckCard: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deckThumbnail: {
    width: 60,
    height: 84,
    borderRadius: 6,
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  deckName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  deckMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#6B3A4A',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  addButton: {
    backgroundColor: '#8B0000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});