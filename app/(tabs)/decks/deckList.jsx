// screens/DeckListPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  TextInput, Image, ActivityIndicator, Alert 
} from 'react-native';
import ItemDeck from '../../../components/ui/item-deck';
import { deckApi } from '@/src/api/deck-api';

// ✅ Map frontend domains to backend domains for filtering
const FRONTEND_TO_BACKEND_DOMAIN = {
  'ygo': 'yugioh',
  'pkm': 'pokemon',
  'mtg': 'magic',
};

const DeckListPage = () => {
  const params = useLocalSearchParams();
  const seriesDomain = params.seriesDomain || 'ygo'; // Frontend: 'ygo', 'pkm', etc.
  const seriesName = params.seriesName || 'Yu-Gi-Oh!';
  const seriesLogo = params.seriesLogo || 'https://www.yugioh-card.com/en/wp-content/uploads/2020/04/logo-main.png';

  console.log('=== DeckListPage Debug ===');
  console.log('Received seriesDomain (frontend):', seriesDomain);
  console.log('Received seriesName:', seriesName);

  const [searchQuery, setSearchQuery] = useState('');
  const [allDecks, setAllDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deckApi.getAllDecks(1, 100);
      const decks = response.metadata.decks || [];
      
      console.log('Total decks fetched:', decks.length);
      console.log('Decks with domains:', decks.map(d => ({ 
        name: d.name, 
        domain: d.domain?.domain 
      })));
      
      setAllDecks(decks);
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
              setAllDecks(prev => prev.filter(d => d.deck_id !== deckId));
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Failed to delete deck.');
            }
          },
        },
      ]
    );
  };

  const handleCreateDeck = async () => {
    try {
      // ✅ Send card_type in the format your API expects
      const defaultDeck = {
        name: 'New Deck',
        card_type: seriesDomain, // ✅ Send 'ygo', 'pkm', 'mtg', etc.
        format: 'OCG',
        cards: [],
      };

      console.log('Creating deck with card_type:', seriesDomain);

      const response = await deckApi.createDeck(defaultDeck);
      const createdDeck = response?.metadata?.deck;

      if (createdDeck && createdDeck.deck_id) {
        // ✅ Reload decks to get the full deck with domain object
        await loadDecks();
        
        router.navigate({
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

  const handleBack = () => router.navigate('/decks');
  
  const handleDeckPress = (deck) => {
    router.push({ 
      pathname: '/decks/deckDetail', 
      params: { 
        deckId: deck.deck_id 
      } 
    });
  };

  // ✅ Filter decks by domain.domain (backend format) AND search query
  const filteredDecks = allDecks.filter(deck => {
    // Get the backend domain from the deck response
    const deckDomain = deck.domain?.domain; // "yugioh", "pokemon", "magic"
    
    // Map frontend seriesDomain to backend domain for comparison
    const expectedDomain = FRONTEND_TO_BACKEND_DOMAIN[seriesDomain] || seriesDomain;
    
    const matchesSeries = deckDomain === expectedDomain;
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeries && matchesSearch;
  });

  console.log('Filtering by seriesDomain (frontend):', seriesDomain);
  console.log('Expected backend domain:', FRONTEND_TO_BACKEND_DOMAIN[seriesDomain]);
  console.log('Filtered decks count:', filteredDecks.length);
  console.log('Filtered decks:', filteredDecks.map(d => ({ 
    name: d.name, 
    domain: d.domain?.domain 
  })));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Deck'}</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: seriesLogo }} 
            style={styles.seriesLogo} 
            resizeMode="contain" 
          />
          <Text style={styles.seriesName}>{seriesName}</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search decks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#555" style={{ marginTop: 50 }} />
        ) : (
          <>
            <Text style={styles.deckCount}>
              {filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''} found
            </Text>

            <View style={styles.deckGrid}>
              <ItemDeck 
                name="Create Deck"
                isCreateNew={true}
                onPress={handleCreateDeck}
              />

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

            {filteredDecks.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? `No decks found matching "${searchQuery}"`
                    : `No ${seriesName} decks yet. Create one to get started!`
                  }
                </Text>
              </View>
            )}
          </>
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
  seriesLogo: { width: 200, height: 80, marginBottom: 8 },
  seriesName: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  searchContainer: { 
    flex: 1, 
    backgroundColor: 'white', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#e0e0e0' 
  },
  searchInput: { 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    fontSize: 16, 
    color: '#1a1a1a' 
  },
  deckCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  deckGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 16 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default DeckListPage;