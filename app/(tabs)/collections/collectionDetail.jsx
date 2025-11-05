import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const CollectionDetailPage = () => {
  const { collectionId } = useLocalSearchParams();
  const [binderName, setBinderName] = useState('New Binder');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownedCards, setOwnedCards] = useState([]);
  const [binderCards, setBinderCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for now - replace with actual API calls later
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setOwnedCards([
        { card_id: '1', name: 'Blue-Eyes White Dragon', image_normal_url: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', owned_quantity: 3 },
        { card_id: '2', name: 'Dark Magician', image_normal_url: 'https://images.ygoprodeck.com/images/cards/46986414.jpg', owned_quantity: 2 },
        { card_id: '3', name: 'Red-Eyes Black Dragon', image_normal_url: 'https://images.ygoprodeck.com/images/cards/74677422.jpg', owned_quantity: 1 },
      ]);
      setLoading(false);
    }, 500);
  }, [collectionId]);

  const handleBack = () => {
    router.back();
  };

  // Filter owned cards by search
  const filteredOwnedCards = ownedCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Collection'}</Text>
        </TouchableOpacity>

        {/* Section 1: Name Editing */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Binder Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter Binder Name"
            value={binderName}
            onChangeText={setBinderName}
            placeholderTextColor="#999"
          />
        </View>

        {/* Section 2: Search Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Search Owned Cards</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section 3: Owned Cards Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Owned Cards</Text>
          <View style={styles.ownedCardsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
              </View>
            ) : filteredOwnedCards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? `No cards found for "${searchQuery}"` : 'No owned cards yet'}
                </Text>
              </View>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ownedCardsScroll}
              >
                {filteredOwnedCards.map((card) => (
                  <TouchableOpacity
                    key={card.card_id}
                    style={styles.ownedCardItem}
                    onPress={() => {/* Add to binder logic */}}
                  >
                    <Image
                      source={{ uri: card.image_normal_url }}
                      style={styles.ownedCardImage}
                      resizeMode="contain"
                    />
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityText}>x{card.owned_quantity}</Text>
                    </View>
                    <Text style={styles.ownedCardName} numberOfLines={2}>
                      {card.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>

        {/* Section 4: 5-Column Binder Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Binder ({binderCards.length} cards)</Text>
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.binderContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.binderGrid}>
                {/* Render binder cards */}
                {binderCards.map((card, index) => (
                  <TouchableOpacity
                    key={`binder-${index}`}
                    style={styles.binderSlot}
                    onPress={() => {/* Remove from binder logic */}}
                  >
                    <Image
                      source={{ uri: card.image_normal_url }}
                      style={styles.binderCardImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
                
                {/* Empty slots (showing 45 slots = 9 rows x 5 columns) */}
                {Array.from({ length: 45 - binderCards.length }).map((_, index) => (
                  <View key={`empty-${index}`} style={[styles.binderSlot, styles.emptySlot]}>
                    <Text style={styles.emptySlotText}>+</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
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
    paddingBottom: 40,
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
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  ownedCardsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    height: 220,
  },
  ownedCardsScroll: {
    paddingVertical: 8,
  },
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
  quantityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#8B0000',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  ownedCardName: {
    marginTop: 4,
    fontSize: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    width: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
  binderContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    minHeight: 400,
    maxHeight: 600,
  },
  binderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  binderSlot: {
    width: '18%', // 5 columns with gap
    aspectRatio: 0.686,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  emptySlot: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  emptySlotText: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  binderCardImage: {
    width: '100%',
    height: '100%',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default CollectionDetailPage;