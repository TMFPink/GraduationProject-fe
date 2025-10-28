// screens/DeckListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  TextInput, Image, ActivityIndicator, Alert 
} from 'react-native';
import ItemDeck from '../../../components/ui/item-deck';
import { deckApi } from '@/src/api/deck-api';

const DeckListPage = ({ route }) => {
  const series = route?.params?.series || { 
    name: 'Yu-Gi-Oh!', 
    logo: 'https://img.yugioh-card.com/en/wp-content/uploads/2020/04/logo-main.png' 
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // === Fetch decks ===
  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deckApi.getAllDecks(1, 20);
      setDecks(response.metadata.decks || []);
    } catch (error) {
      console.error('Failed to fetch decks:', error);
      Alert.alert('Error', 'Unable to load decks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // === Delete deck ===
  const handleDelete = async (deckId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this deck?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deckApi.deleteDeck(deckId);
              setDecks(prev => prev.filter(d => d.deck_id !== deckId));
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Failed to delete deck.');
            }
          },
        },
      ]
    );
  };

  // === Create deck ===
  const handleCreateDeck = async () => {
    try {
      const defaultDeck = {
        name: 'New Deck',
        card_type: 'ygo',
        format: 'OCG',
        cards: [],
      };

      const response = await deckApi.createDeck(defaultDeck);
      const createdDeck = response?.metadata?.deck;

      if (createdDeck && createdDeck.deck_id) {
        setDecks(prev => [...prev, createdDeck]);
        
        // ✅ FIXED: Pass only deckId - DeckDetail will fetch full data
        router.push({
          pathname: '/decks/deckDetail',
          params: { 
            deckId: createdDeck.deck_id
          },
        });
      } else {
        console.error('Unexpected response structure:', response);
        Alert.alert('Error', 'Failed to create new deck.');
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('Error', 'Unable to create new deck.');
    }
  };

  // === Navigation ===
  const handleBack = () => router.navigate('/decks');
  
  // ✅ FIXED: Pass only deckId - DeckDetail will fetch full data
  const handleDeckPress = (deck) => {
    router.push({ 
      pathname: '/decks/deckDetail', 
      params: { 
        deckId: deck.deck_id 
      } 
    });
  };

  // === Search filter ===
  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Deck'}</Text>
        </TouchableOpacity>

        {/* Series Logo */}
        <View style={styles.logoContainer}>
          <Image source={{ uri: series.logo }} style={styles.seriesLogo} resizeMode="contain" />
        </View>

        {/* Search Bar */}
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
        </View>

        {/* Loading State */}
        {loading ? (
          <ActivityIndicator size="large" color="#555" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.deckGrid}>
            {/* Create Deck */}
            <ItemDeck 
              name="Create Deck"
              isCreateNew={true}
              onPress={handleCreateDeck}
            />

            {/* Deck List */}
            {filteredDecks.map((deck) => (
              <ItemDeck
                key={deck.deck_id}
                name={deck.name}
                image={'https://images.ygoprodeck.com/images/cards/46986414.jpg'}
                onPress={() => handleDeckPress(deck)}
                onDelete={() => handleDelete(deck.deck_id)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20 },
  backButton: { marginBottom: 20, paddingVertical: 5 },
  backText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  seriesLogo: { width: 200, height: 80 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  searchContainer: { flex: 1, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  searchInput: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#1a1a1a' },
  deckGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
});

export default DeckListPage;