// screens/DeckListPage.jsx
import React, { useState } from 'react';
import { router } from 'expo-router';

import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import ItemDeck from '../../../components/ui/item-deck';
const DeckListPage = ({ route, navigation }) => {
  // Get series from navigation params
  const series = route?.params?.series || { 
    name: 'Yu-Gi-Oh!', 
    logo: 'https://img.yugioh-card.com/en/wp-content/uploads/2020/04/logo-main.png' 
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const decks = [
    { 
      id: 1, 
      name: 'Dragoon Fireshift', 
      image: 'https://images.ygoprodeck.com/images/cards/26593852.jpg' 
    },
    { 
      id: 2, 
      name: 'Dragoon Fireshift', 
      image: 'https://images.ygoprodeck.com/images/cards/26593852.jpg' 
    },
    { 
      id: 3, 
      name: 'Dragoon Fireshift', 
      image: 'https://images.ygoprodeck.com/images/cards/26593852.jpg' 
    },
    { 
      id: 4, 
      name: 'Blue-Eyes White Dragon', 
      image: 'https://images.ygoprodeck.com/images/cards/89631139.jpg' 
    },
    { 
      id: 5, 
      name: 'Dark Magician', 
      image: 'https://images.ygoprodeck.com/images/cards/46986414.jpg' 
    },
  ];

  const handleBack = () => {
    router.navigate('/decks');
  };

  const handleCreateDeck = () => {
    console.log('Create new deck');
    // Navigate to deck creation screen
    // navigation.navigate('CreateDeck');
  };

  const handleDeckPress = (deck) => {
    console.log('Selected deck:', deck.name);
    // Navigate to deck detail screen
    // navigation.navigate('DeckDetail', { deck });
    router.push('/decks/deckDetail', { deck });
  };

  const handleDelete = () => {
    console.log('Delete action');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Deck'}</Text>
        </TouchableOpacity>

        {/* Series Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: series.logo }} 
            style={styles.seriesLogo}
            resizeMode="contain"
          />
        </View>

        {/* Search Bar with Delete Icon */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>

        {/* Deck Grid - Using ItemDeck Component */}
        <View style={styles.deckGrid}>
          {/* Create Deck Card */}
          <ItemDeck 
            name="Create Deck"
            isCreateNew={true}
            onPress={handleCreateDeck}
          />
          
          {/* Existing Decks */}
          {decks.map((deck) => (
            <ItemDeck
              key={deck.id}
              name={deck.name}
              image={deck.image}
              onPress={() => handleDeckPress(deck)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    paddingVertical: 5,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  seriesLogo: {
    width: 200,
    height: 80,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  deleteButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
});

export default DeckListPage;
