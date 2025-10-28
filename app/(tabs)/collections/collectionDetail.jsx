import React, { useEffect, useState, useCallback } from 'react';
import { View,Image, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DeckCardItem from '@/components/ui/item-deck-card';
import { cardApi } from '@/src/api/card-api';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';


// Card component for the card pool
const CardPoolItem = ({ card, onAdd }) => (
  <TouchableOpacity style={styles.cardPoolItem} onPress={() => onAdd(card)}>
    <View style={styles.cardImageContainer}>
      {card.image_thumb_url ? (
        <Image
          source={{ uri: card.image_normal_url }}
          style={styles.cardImagePlaceholder}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImageText}>No Image</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);



const DeckDetailPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cardPool, setCardPool] = useState([]);

  const { deck } = useLocalSearchParams();
  const [deckName, setDeckName] = useState(deck?.name || '');


  const [selectedFormat, setSelectedFormat] = useState('advanced');
  const [filterType, setFilterType] = useState('main');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const CARDS_PER_PAGE = 20;

  // NEW: Search-specific states
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchDebounceTimer, setSearchDebounceTimer] = useState(null);

  // Load cards with pagination (browse mode)
  const loadCard = async (page = 1, shouldAppend = false) => {
    try {
      if (isLoadingMore) return;
      
      setIsLoadingMore(true);
      
      const response = await cardApi.getMetadataCard(CARDS_PER_PAGE, page);
      
      if (response.statusCode === 200 && response) {
        const newCards = response.metadata.cards;
        
        if (newCards.length < CARDS_PER_PAGE) {
          setHasMoreCards(false);
        }
        
        if (shouldAppend) {
          setCardPool(prev => [...prev, ...newCards]);
        } else {
          setCardPool(newCards);
        }
        
        console.log(`Loaded page ${page} with ${newCards.length} cards`);
      } else {
        setCardPool([]); 
        console.log('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error loading card list:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // NEW: Search cards by name via API
  const searchCards = async (query) => {
    if (!query || query.trim() === '') {
      // If search is cleared, exit search mode and load normal cards
      setIsSearchMode(false);
      setCurrentPage(1);
      setHasMoreCards(true);
      loadCard(1, false);
      return;
    }

    try {
      setIsLoadingMore(true);
      setIsSearchMode(true);
      
      // Use the existing getAllCards API with search parameter
      const response = await cardApi.getMetadataCard(1000, 1, query); // Get up to 1000 search results
      
      if (response.statusCode === 200 && response) {
        const searchResults = response.metadata.cards || [];
        setCardPool(searchResults);
        
        // In search mode, we show all results at once (no pagination)
        setHasMoreCards(false);
        
        console.log(`Search found ${searchResults.length} cards for "${query}"`);
      } else {
        setCardPool([]);
        console.log('No search results found');
      }
    } catch (error) {
      console.error('Error searching cards:', error);
      setCardPool([]);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // NEW: Handle search input with debouncing
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    
    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }
    
    // Set new timer to search after 500ms of no typing
    const timer = setTimeout(() => {
      searchCards(text);
    }, 500);
    
    setSearchDebounceTimer(timer);
  };

  // Load more cards when scrolling (only in browse mode, not search mode)
  const loadMoreCards = () => {
    if (!isLoadingMore && hasMoreCards && !isSearchMode) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCard(nextPage, true);
    }
  };

  // Handle scroll event
  const handleCardPoolScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
                            contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !isSearchMode) {
      loadMoreCards();
    }
  };

  // Reset on focus
  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      setHasMoreCards(true);
      setIsSearchMode(false);
      setSearchQuery('');
      loadCard(1, false);
    }, [])
  );

  // Initial load
  useEffect(() => {
    loadCard(1, false);
  }, []);

  //deck useeffect
  useEffect(() => {
    if (deck) {
      setDeckName(deck.name || '');
    }
  }, [deck]);


  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    };
  }, [searchDebounceTimer]);

  // Deck state
  const [mainDeck, setMainDeck] = useState({});
  const [extraDeck, setExtraDeck] = useState({});
  const [sideDeck, setSideDeck] = useState({});

  // Calculate deck counts
  const getMainDeckCount = () => Object.values(mainDeck).reduce((sum, count) => sum + count, 0);
  const getExtraDeckCount = () => Object.values(extraDeck).reduce((sum, count) => sum + count, 0);
  const getSideDeckCount = () => Object.values(sideDeck).reduce((sum, count) => sum + count, 0);




 // Add card to deck

 const isExtraDeckMonster = (card) => {
  const cardType = card.meta_data.type;
  if (!cardType) return false;
  
  const extraDeckTypes = ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster'];
  return extraDeckTypes.some(type => cardType.includes(type));
};

const addToDeck = (card, deckType) => {
  let targetDeck;
  
  if (deckType === "main") {
    // Smart routing: check if it's an extra deck monster
    if (isExtraDeckMonster(card)) {
      targetDeck = "extra";
    } else {
      targetDeck = "main";
    }
  } else if (deckType === "side") {
    // Side deck accepts everything
    targetDeck = "side";
  }
  
  // Then use the existing logic with targetDeck instead of deckType
  const setDeck = targetDeck === "main" ? setMainDeck 
                : targetDeck === "extra" ? setExtraDeck 
                : setSideDeck;
                
  const cardId = card.card_id;
  setDeck((prev) => ({
    ...prev,
    [cardId]: Math.min((prev[cardId] || 0) + 1, 3),
  }));
};

// Remove card from deck
const removeFromDeck = (card, deckType) => {
  const setDeck =
    deckType === "main"
      ? setMainDeck
      : deckType === "extra"
      ? setExtraDeck
      : setSideDeck;

  const cardId = card.card_id;
  setDeck((prev) => {
    const newCount = (prev[cardId] || 0) - 1;
    if (newCount <= 0) {
      const { [cardId]: _, ...rest } = prev;
      return rest;
    }
    return { ...prev, [cardId]: newCount };
  });
};


  // Get cards in deck with counts
  const getDeckCards = (deck) => {
        console.log(deck);

    return Object.entries(deck).map(([cardId, count]) => ({
      card: cardPool.find(c => c.card_id === cardId),
      count
      
    })).filter(item => item.card);
  };

  const handleBack = () => {
    router.navigate('/decks/deckList');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Deck'}</Text>
        </TouchableOpacity>

        {/* Deck Name Input */}
        <View style={styles.deckHeaderSection}>
          <TextInput
            style={styles.deckNameInput}
            placeholder="Enter Deck Name"
            value={deckName}
            onChangeText={setDeckName}
            placeholderTextColor="#999"
          />
          <View style={styles.deckCountsRow}>
            <Text style={styles.deckCountText}>Main: {getMainDeckCount()}/40-60</Text>
            <Text style={styles.deckCountText}>Extra: {getExtraDeckCount()}/15</Text>
            <Text style={styles.deckCountText}>Side: {getSideDeckCount()}/15</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Import File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Hand Test</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Deck</Text>
        </TouchableOpacity>

        {/* Search Bar - UPDATED with new handler */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor="#999"
            />
            {/* NEW: Show clear button when searching */}
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                style={styles.clearButton}
                onPress={() => handleSearchChange('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* NEW: Show search mode indicator */}
          {isSearchMode && (
            <Text style={styles.searchModeText}>
              {cardPool.length} result{cardPool.length !== 1 ? 's' : ''} found
            </Text>
          )}
        </View>

        {/* Format and Filter Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.formatPickerContainer}>
            <Text style={styles.controlLabel}>Format:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedFormat}
                onValueChange={setSelectedFormat}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Advanced" value="advanced" />
                <Picker.Item label="Traditional" value="traditional" />
                <Picker.Item label="Speed Duel" value="speed" />
              </Picker>
            </View>
          </View>
          <View style={styles.filterContainer}>
            <Text style={styles.controlLabel}>Deck Target:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={filterType}
                onValueChange={setFilterType}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Main Deck" value="main" />
                <Picker.Item label="Side Deck" value="side" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Card Pool Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Pool</Text>
          <View style={styles.cardPoolScroll}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              onScroll={handleCardPoolScroll}
              scrollEventThrottle={400}
            >
              <View style={styles.cardPoolGrid}>
                {cardPool.map((card) => (
                  <CardPoolItem 
                    key={card.card_id}
                    card={card} 
                    onAdd={(card) => addToDeck(card, filterType)}
                  />
                ))}
              </View>
              {/* Loading indicator */}
              {isLoadingMore && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.loadingText}>
                    {isSearchMode ? 'Searching...' : 'Loading more cards...'}
                  </Text>
                </View>
              )}
              {/* End of list indicator - only show in browse mode */}
              {!hasMoreCards && cardPool.length > 0 && !isSearchMode && (
                <View style={styles.endOfListContainer}>
                  <Text style={styles.endOfListText}>No more cards to load</Text>
                </View>
              )}
              {/* No results message */}
              {!isLoadingMore && cardPool.length === 0 && searchQuery.length > 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No cards found for "{searchQuery}"</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Main Deck Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Deck</Text>
            <Text style={styles.sectionCount}>{getMainDeckCount()} cards</Text>
          </View>
          <View style={styles.deckContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(mainDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={(card) => addToDeck(card, 'main')}
                    onRemove={(card) => removeFromDeck(card, 'main')}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Extra Deck Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Extra Deck</Text>
            <Text style={styles.sectionCount}>{getExtraDeckCount()}/15 cards</Text>
          </View>
          <View style={[styles.deckContainer, styles.smallDeckContainer]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(extraDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={(card) => addToDeck(card, 'extra')}
                    onRemove={(card) => removeFromDeck(card, 'extra')}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Side Deck Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Side Deck</Text>
            <Text style={styles.sectionCount}>{getSideDeckCount()}/15 cards</Text>
          </View>
          <View style={[styles.deckContainer, styles.smallDeckContainer]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(sideDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={(card) => addToDeck(card, 'side')}
                    onRemove={(card) => removeFromDeck(card, 'side')}
                  />
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
    marginBottom: 70,
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
  deckHeaderSection: {
    marginBottom: 16,
  },
  deckNameInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  deckCountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  deckCountText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  searchRow: {
    marginBottom: 16,
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
  // NEW: Clear button styles
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  // NEW: Search mode indicator
  searchModeText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  formatPickerContainer: {
    flex: 1,
  },
  filterContainer: {
    flex: 1,
  },
  controlLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  pickerItem: {
    fontSize: 14,
    height: 44,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  cardPoolScroll: {
    maxHeight: 440,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  cardPoolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    display: 'flex',
    justifyContent: 'center',
    gap: 10,
  },
  cardPoolItem: {
    width: '23%',
    marginBottom: 8,
  },
  cardImageContainer: {
    position: 'relative',
    aspectRatio: 0.686,
    marginBottom: 4,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardImageText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  cardPoolName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
  },
  endOfListContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  endOfListText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  // NEW: No results styles
  noResultsContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  deckContainer: {
    height: 500,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  smallDeckContainer: {
    height: 200,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});

export default DeckDetailPage;