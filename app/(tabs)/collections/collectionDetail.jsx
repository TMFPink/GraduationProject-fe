import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { ownedCardApi } from '@/src/api/ownedcard-api';
import { collectionApi } from '@/src/api/collection-api';
import { cardApi } from '@/src/api/card-api';

const CollectionDetailPage = () => {
  const { collectionId } = useLocalSearchParams();
  const [binderName, setBinderName] = useState('New Binder');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownedCards, setOwnedCards] = useState([]);
  const [binderCards, setBinderCards] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingBinder, setIsLoadingBinder] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [mainBinder, setMainBinder] = useState({});

  // ===== LOAD BINDER DATA FROM API =====
  const loadBinderData = async () => {
    if (!collectionId) {
      setIsLoadingBinder(false);
      return;
    }

    try {
      setIsLoadingBinder(true);
      const { metadata } = await collectionApi.getCollectionById(collectionId);

      if (metadata?.collection) {
        const { name, CollectionCards } = metadata.collection;
        setBinderName(name ?? 'New Binder');

        if (CollectionCards?.length) await loadBinderCard(CollectionCards);
        else setIsLoadingBinder(false);
      } else {
        setIsLoadingBinder(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to load binder.');
      setIsLoadingBinder(false);
      
    }
  };

  const loadBinderCard = async (binderCards) => {
  try {
    const cardIds = binderCards.map((bc) => 
      typeof bc === 'object' ? bc.card_id : bc
    );

    const responses = await Promise.all(
      cardIds.map((id) => cardApi.getCardById(id).catch(() => null))
    );

    const newMain = {};

    responses.forEach((res) => {
      if (!res || res.statusCode !== 200) return;
      const card = res.metadata;
      if (!card?.card_id) return;

      if (newMain[card.card_id]) {
        newMain[card.card_id].quantity += 1;
      } else {
        newMain[card.card_id] = { card, quantity: 1 };
      }
    });

    setMainBinder(newMain);
    setIsLoadingBinder(false);
  } catch {
    setIsLoadingBinder(false);
  }
};


  useEffect(() => {
    loadBinderData();
  }, [collectionId]);

  // ===== LOAD OWNED CARDS =====
  const fetchOwnedCards = async () => {
    try {
      setLoading(true);
      const ownedResponse = await ownedCardApi.getAllOwnedCards(1, 100);
      const ownedCardsData = ownedResponse.metadata?.ownedCards || [];
      setOwnedCards(ownedCardsData);
    } catch (error) {
      console.error('Error fetching owned cards:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOwnedCards();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOwnedCards();
    }, [])
  );

  // ===== SYNC mainBinder → binderCards (flatten for display) =====
  useEffect(() => {
    const flattened = Object.values(mainBinder).flatMap(entry => 
      Array(entry.quantity).fill(entry.card)
    );
    setBinderCards(flattened);
  }, [mainBinder]);

  // ===== ADD CARD TO BINDER =====
  const addToBinder = (ownedCard) => {
    const card = ownedCard.Card;
    
    setMainBinder((prev) => {
      const existing = prev[card.card_id];
      
      if (existing) {
        // Check if we can add more (don't exceed owned quantity)
        if (existing.quantity < ownedCard.quantity) {
          return {
            ...prev,
            [card.card_id]: {
              ...existing,
              quantity: existing.quantity + 1,
            }
          };
        }
        // Already at max quantity
        Alert.alert('Limit Reached', `You only own ${ownedCard.quantity} of this card.`);
        return prev;
      }
      
      // First time adding this card
      return {
        ...prev,
        [card.card_id]: {
          card,
          quantity: 1,
        }
      };
    });
  };

  // ===== REMOVE CARD FROM BINDER =====
  const removeFromBinder = (card) => {
    setMainBinder((prev) => {
      const current = prev[card.card_id];
      if (!current) return prev;
      
      if (current.quantity <= 1) {
        // Remove completely
        const { [card.card_id]: _, ...rest } = prev;
        return rest;
      }
      
      // Decrement quantity
      return {
        ...prev,
        [card.card_id]: { 
          ...current, 
          quantity: current.quantity - 1 
        },
      };
    });
  };

  // ===== SAVE BINDER =====
  const handleSaveBinder = async () => {
    if (!collectionId) {
      Alert.alert('Error', 'No collection ID.');
      return;
    }
    
    setIsSaving(true);
    try {
      // Flatten mainBinder to array of card_ids (duplicates for quantity)
      const cards = Object.values(mainBinder).flatMap(entry =>
        Array(entry.quantity).fill(entry.card.card_id)
      );

      await collectionApi.updateCollection(collectionId, {
        name: binderName,
        cards,
      });

      Alert.alert('Success', 'Collection saved!');
    } catch {
      Alert.alert('Error', 'Failed to save collection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.navigate('/collections');
  };

  // ===== FILTER OWNED CARDS =====
  const filteredOwnedCards = ownedCards.filter(ownedCard => {
    const card = ownedCard.Card;
    return card && card.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ===== RENDER =====
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
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveBinder}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Binder</Text>
            )}
          </TouchableOpacity>
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

        {/* Section 3: Owned Cards Pool */}
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
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <View style={styles.ownedCardsGrid}>
                  {filteredOwnedCards.map((ownedCard, index) => {
                    const card = ownedCard.Card;
                    const inBinderQty = mainBinder[card.card_id]?.quantity || 0;
                    const canAdd = inBinderQty < ownedCard.quantity;
                    
                    return (
                      <TouchableOpacity
                        key={`${card.card_id}-${index}`}
                        style={styles.ownedCardItem}
                        onPress={() => addToBinder(ownedCard)}
                        disabled={!canAdd}
                        activeOpacity={canAdd ? 0.7 : 1}
                      >
                        <View style={styles.ownedCardImageContainer}>
                          <Image
                            source={{ uri: card.image_normal_url || card.image_small_url }}
                            style={[
                              styles.ownedCardImage,
                              !canAdd && styles.disabledCard
                            ]}
                            resizeMode="contain"
                          />
                        </View>
                        
                        {/* Quantity Badge */}
                        {ownedCard.quantity > 1 && (
                          <View style={styles.quantityBadge}>
                            <Text style={styles.quantityText}>
                              {inBinderQty}/{ownedCard.quantity}
                            </Text>
                          </View>
                        )}
                        
                        {/* Add indicator */}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>
        </View>

        {/* Section 4: Binder Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Binder ({binderCards.length} cards)
            </Text>
          </View>
          
          <View style={styles.binderContainer}>
            {isLoadingBinder ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B0000" />
                <Text style={styles.loadingText}>Loading binder...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.binderGrid}>
                  {binderCards.length === 0 ? (
                    <View style={styles.emptyBinderContainer}>
                      <Text style={styles.emptyBinderText}>
                        Tap cards from "Owned Cards" to add them here
                      </Text>
                    </View>
                  ) : (
                    binderCards.map((card, index) => (
                      <TouchableOpacity
                        key={`binder-${card.card_id}-${index}`}
                        style={styles.binderSlot}
                        onPress={() => removeFromBinder(card)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: card.image_normal_url }}
                          style={styles.binderCardImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </ScrollView>
            )}
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
    paddingHorizontal: 20,
    paddingTop: 50,
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
    marginBottom: 12,
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
    maxHeight: 440,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  ownedCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  ownedCardItem: {
    width: '23%',
    marginBottom: 8,
    position: 'relative',
  },
  ownedCardImageContainer: {
    aspectRatio: 0.686,
    marginBottom: 4,
  },
  ownedCardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  disabledCard: {
    opacity: 0.4,
  },
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
  addIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIndicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
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
    width: '18%',
    aspectRatio: 0.686,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    position: 'relative',
  },
  binderCardImage: {
    width: '100%',
    height: '100%',
  },
  removeIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(139, 0, 0, 0.8)',
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIndicatorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBinderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    width: '100%',
  },
  emptyBinderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 40,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default CollectionDetailPage;