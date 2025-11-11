// screens/CollectionPage.jsx
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, TextInput, Image, ActivityIndicator, Alert  
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import ItemDeck from '../../../components/ui/item-deck';
import { collectionApi } from '@/src/api/collection-api';
import { ownedCardApi } from '@/src/api/ownedcard-api';

const CollectionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ownedCards, setOwnedCards] = useState([]);
  const [myBinders, setMyBinders] = useState([]);
  const [loading, setLoading] = useState(true);



  // Fetch owned cards and collections
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch owned cards using ownedCardApi
      const ownedResponse = await ownedCardApi.getAllOwnedCards(1, 100);
      const ownedCardsData = ownedResponse.metadata?.ownedCards || [];
      setOwnedCards(ownedCardsData);
      
      // Fetch custom binders (collections)
      const collectionsResponse = await collectionApi.getAllCollection(1, 100);
      const collections = collectionsResponse.metadata?.collections || collectionsResponse.collections || [];
      
      // Filter out any "Owned Cards" collection if it exists (we don't need it anymore)
      const binders = collections.filter(col => col.name !== "Owned Cards");
      setMyBinders(binders);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when page gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // === Create new binder ===
  const handleCreateBinder = async () => {
    try {
      const defaultBinder = {
        name: 'New Binder',
        card_type: 'ygo',
        cards: []
      };

      const response = await collectionApi.createCollection(defaultBinder);
      const createdBinder = response?.metadata?.collection;

      if (createdBinder && createdBinder.collection_id) {
        setMyBinders(prev => [...prev, createdBinder]);
        Alert.alert('Success', 'New binder created!');
      } else {
        console.error('Unexpected response structure:', response);
        Alert.alert('Error', 'Failed to create new binder.');
      }
    } catch (error) {
      console.error('Error creating binder:', error);
      Alert.alert('Error', 'Unable to create new binder.');
    }
  };

  // === Delete binder ===
  const handleDeleteBinder = async (collectionId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this binder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await collectionApi.deleteCollection(collectionId);
              setMyBinders(prev => prev.filter(b => b.collection_id !== collectionId));
              Alert.alert('Success', 'Binder deleted.');
            } catch (err) {
              console.error('Delete failed:', err);
              Alert.alert('Error', 'Failed to delete binder.');
            }
          },
        },
      ]
    );
  };

  const handleCollectionPress = (binder) => {
    router.push({ 
      pathname: '/collections/collectionDetail', 
      params: { 
        collectionId: binder.collection_id 
      } 
    });
  };

  // Filter binders by search
  const filteredBinders = myBinders.filter(binder =>
    binder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>

        {/* ===== Header ===== */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Collection</Text>
        </View>

        {/* ===== Search Bar ===== */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your binders..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ===== Owned Cards Section ===== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>Owned Cards</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.deckContainer, styles.featuredDeckContainer]}>
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#8B0000" />
            </View>
          ) : ownedCards.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#666', textAlign: 'center' }}>
                No cards in your collection yet.{'\n'}
                Add cards from the card detail page.
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
            >
              {ownedCards.map((ownedCard, index) => {
                const card = ownedCard.Card; // Extract nested Card object
                return (
                  <TouchableOpacity
                    key={`${card.card_id}-${index}`}
                    onPress={() =>
                      router.push({
                        pathname: '/cardDetail',
                        params: { card: JSON.stringify(card) },
                      })
                    }
                    style={styles.ownedCardItem}
                  >
                    <Image
                      source={{ uri: card.image_normal_url || card.image_small_url }}
                      style={styles.ownedCardImage}
                      resizeMode="contain"
                    />
                    {/* Quantity Badge */}
                    {ownedCard.quantity > 1 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>x{ownedCard.quantity}</Text>
                      </View>
                    )}
                    <Text 
                      style={styles.ownedCardName}
                      numberOfLines={2}
                    >
                      {card.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ===== My Binders ===== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>My Binders</Text>
        </View>

        <View style={styles.deckGrid}>
          <ItemDeck 
            name="Create Binder"
            isCreateNew={true}
            onPress={handleCreateBinder}
          />
          {filteredBinders.map((binder) => (
            <ItemDeck 
              key={binder.collection_id}
              name={binder.name}
              collectionId={binder.collection_id}
              onPress={() => handleCollectionPress(binder)}
              onDelete={() => handleDeleteBinder(binder.collection_id)}
            />
          ))}
        </View>

      </View>
    </ScrollView>
  );
};

export default CollectionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingBottom: 80,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // ===== Header =====
  headerRow: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  // ===== Search Bar =====
  searchRow: {
    marginBottom: 28,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },

  // ===== Section Header =====
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },

  // ===== Deck Containers =====
  deckContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    marginBottom: 24,
  },
  featuredDeckContainer: {
    height: 200,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  // Owned Cards Styling
  ownedCardItem: {
    marginRight: 12,
    width: 110,
    alignItems: 'center',
    position: 'relative',
  },
  ownedCardImage: {
    width: 100,
    height: 146,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  ownedCardName: {
    marginTop: 4,
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    width: 100,
  },
  // Quantity Badge
  quantityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});