import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DeckCardItem from '@/components/ui/item-deck-card';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { deckApi } from '@/src/api/deck-api';
import { cardApi } from '@/src/api/card-api';
import FilterModal from '@/components/ui/modals/filterModal';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/* --------------------------------------------------------------
   CardPoolItem – tiny reusable component for the card pool
   -------------------------------------------------------------- */
const CardPoolItem = ({ card, onAdd }) => (
  <TouchableOpacity style={styles.cardPoolItem} onPress={() => onAdd(card)}>
    <View style={styles.cardImageContainer}>
      {card.image_normal_url ? (
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



/* --------------------------------------------------------------
   Main component
   -------------------------------------------------------------- */
const DeckDetailPage = () => {
  const { deckId } = useLocalSearchParams();

  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);


  /* ---------- Deck meta ---------- */
  const [deckName, setDeckName] = useState('New Deck');
  const [selectedFormat, setSelectedFormat] = useState('OCG');
  const [cardType, setCardType] = useState(
    'ygo'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);

  /* ---------- Deck cards ---------- */
  const [mainDeck, setMainDeck] = useState({});
  const [extraDeck, setExtraDeck] = useState({});
  const [sideDeck, setSideDeck] = useState({});

  /* ---------- Card pool ---------- */
  const [searchQuery, setSearchQuery] = useState('');
  const [cardPool, setCardPool] = useState([]);
  const [filterType, setFilterType] = useState('main');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);

  const [activeFilters, setActiveFilters] = useState({});

  const handleFilterApply = (newFilters) => {
    setActiveFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };


  
  const CARDS_PER_PAGE = 20;

  /* --------------------------------------------------------------
     Load the deck (metadata + cards)
     -------------------------------------------------------------- */
  const loadDeckData = async () => {
    if (!deckId) {
      setIsLoadingDeck(false);
      return;
    }

    try {
      setIsLoadingDeck(true);
      const { metadata } = await deckApi.getDeckById(deckId);

      if (metadata?.deck) {
        const { name, format, card_type, cards } = metadata.deck;
        setDeckName(name ?? 'New Deck');
        setSelectedFormat(format ?? 'OCG');
        setCardType(card_type ?? cardType);

        if (cards?.length) await loadDeckCards(cards);
        else setIsLoadingDeck(false);
      } else {
        setIsLoadingDeck(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to load deck.');
      setIsLoadingDeck(false);
    }
  };

  const loadDeckCards = async (deckCards) => {
    try {
      const responses = await Promise.all(
        deckCards.map((dc) =>
          cardApi.getCardById(dc.card_id).catch(() => null)
        )
      );

      const newMain = {};
      const newExtra = {};

      responses.forEach((res, i) => {
        if (!res || res.statusCode !== 200) return;
        const card = res.metadata;
        if (!card?.card_id) return;

        const entry = { card, quantity: deckCards[i].quantity };
        isExtraDeckMonster(card)
          ? (newExtra[card.card_id] = entry)
          : (newMain[card.card_id] = entry);
      });

      setMainDeck(newMain);
      setExtraDeck(newExtra);
      setSideDeck({});
      setIsLoadingDeck(false);
    } catch {
      setIsLoadingDeck(false);
    }
  };

  useEffect(() => {
    loadDeckData();
  }, [deckId]);


  //extra
  
  /* --------------------------------------------------------------
     Card pool – pagination & search
     -------------------------------------------------------------- */
  const loadCardPool = async (page = 1, append = false, query = '', filters = {}) => {
  if (isLoadingMore) return;
  setIsLoadingMore(true);

  try {
    // ✅ Pass filters as the 4th param
    const response = await cardApi.getMetadataCard(
      query ? 1000 : CARDS_PER_PAGE,
      page,
      query,
      filters
    );

    if (response.statusCode === 200 && response.metadata?.cards) {
      const cards = response.metadata.cards;
      setHasMoreCards(!query && cards.length === CARDS_PER_PAGE);

      if (append) {
        setCardPool((prev) => [...prev, ...cards]);
      } else {
        setCardPool(cards);
      }
    } else {
      setCardPool([]);
    }
  } catch (error) {
    console.error('Error loading cards:', error);
    setCardPool([]);
  } finally {
    setIsLoadingMore(false);
  }
};

const performSearch = (text, filters = {}) => {
  const trimmed = text.trim();
  setIsSearchMode(!!trimmed);
  setCurrentPage(1);
  setHasMoreCards(!trimmed);

  // ✅ Apply search + filters
  loadCardPool(1, false, trimmed, filters);
};

const handleSearchChange = (text) => {
  setSearchQuery(text);
  if (searchTimer) clearTimeout(searchTimer);

  const timer = setTimeout(() => {
    performSearch(text, activeFilters); // ✅ include active filters
  }, 400);

  setSearchTimer(timer);
};

const loadMore = () => {
  if (!isLoadingMore && hasMoreCards && !isSearchMode) {
    const next = currentPage + 1;
    setCurrentPage(next);
    loadCardPool(next, true, searchQuery, activeFilters); // ✅ include filters
  }
};


  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const nearBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - 30;

    if (nearBottom && !isSearchMode) loadMore();
  };

  useFocusEffect(
    useCallback(() => {
      setCurrentPage(1);
      setHasMoreCards(true);
      setIsSearchMode(false);
      setSearchQuery('');
      loadCardPool(1, false);
    }, [])
  );

  useEffect(() => {
    loadCardPool(1, false);
  }, []);

  /* --------------------------------------------------------------
     Save deck
     -------------------------------------------------------------- */
  const handleSaveDeck = async () => {
    if (!deckId) {
      Alert.alert('Error', 'No deck ID.');
      return;
    }
    setIsSaving(true);
    try {
      const cards = [...Object.values(mainDeck), ...Object.values(extraDeck), ...Object.values(sideDeck)].map(
        (e) => ({
          card_id: e.card.card_id,
          quantity: e.quantity,
        })
      );

      await deckApi.updateDeck(deckId, {
        name: deckName,
        format: selectedFormat,
        card_type: cardType,
        cards,
      });

      Alert.alert('Success', 'Deck saved!');
    } catch {
      Alert.alert('Error', 'Failed to save deck.');
    } finally {
      setIsSaving(false);
    }
  };

  /* --------------------------------------------------------------
     Helpers
     -------------------------------------------------------------- */
  const deckCounts = {
    main: Object.values(mainDeck).reduce((s, e) => s + e.quantity, 0),
    extra: Object.values(extraDeck).reduce((s, e) => s + e.quantity, 0),
    side: Object.values(sideDeck).reduce((s, e) => s + e.quantity, 0),
  };

  const isExtraDeckMonster = (card) => {
    const type = card.type || card.meta_data?.type;
    if (!type) return false;
    return ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster'].some((t) =>
      type.includes(t)
    );
  };

  const addToDeck = (card, type) => {
    const target =
      type === 'main' ? (isExtraDeckMonster(card) ? 'extra' : 'main') : type;
    const setter =
      target === 'main'
        ? setMainDeck
        : target === 'extra'
        ? setExtraDeck
        : setSideDeck;

    setter((prev) => ({
      ...prev,
      [card.card_id]: {
        card,
        quantity: Math.min((prev[card.card_id]?.quantity || 0) + 1, 3),
      },
    }));
  };

  const removeFromDeck = (card, type) => {
    const setter =
      type === 'main'
        ? setMainDeck
        : type === 'extra'
        ? setExtraDeck
        : setSideDeck;

    setter((prev) => {
      const cur = prev[card.card_id];
      if (!cur) return prev;
      if (cur.quantity <= 1) {
        const { [card.card_id]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [card.card_id]: { ...cur, quantity: cur.quantity - 1 },
      };
    });
  };

  const getDeckCards = (deck) =>
    Object.values(deck).map((e) => ({ card: e.card, count: e.quantity }));

  const goBack = () => router.navigate('/decks/deckList');

  /* --------------------------------------------------------------
     Render
     -------------------------------------------------------------- */
  if (isLoadingDeck) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading deck…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Back */}
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backText}>&lt; Deck</Text>
        </TouchableOpacity>

        {/* Name + counts */}
        <View style={styles.deckHeaderSection}>
          <TextInput
            style={styles.deckNameInput}
            placeholder="Enter Deck Name"
            value={deckName}
            onChangeText={setDeckName}
            placeholderTextColor="#999"
          />
          <View style={styles.deckCountsRow}>
            <Text style={styles.deckCountText}>
              Main: {deckCounts.main}/40-60
            </Text>
            <Text style={styles.deckCountText}>
              Extra: {deckCounts.extra}/15
            </Text>
            <Text style={styles.deckCountText}>
              Side: {deckCounts.side}/15
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Import File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Hand Test</Text>
          </TouchableOpacity>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveDeck}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving…' : 'Save Deck'}
          </Text>
        </TouchableOpacity>

        {/* Search */}
        {/* Search + Filter Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards…"
              value={searchQuery}
              onChangeText={handleSearchChange}
              placeholderTextColor="#999"
            />
            {searchQuery ? (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleSearchChange('')}
              >
                <Text style={styles.clearButtonText}>X</Text>
              </TouchableOpacity>
            ) : null}
                      {/* Filter Icon Button */}
          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <MaterialCommunityIcons name="filter-variant" size={22} color="#333" />
          </TouchableOpacity>
          </View>


        </View>

        {isSearchMode && (
          <Text style={styles.searchModeText}>
            {cardPool.length} result{cardPool.length !== 1 ? 's' : ''} found
          </Text>
        )}



        {/* Filters */}
        <View style={styles.controlsRow}>
          <View style={styles.formatPickerContainer}>
            <Text style={styles.controlLabel}>Format:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedFormat}
                onValueChange={setSelectedFormat}
                style={styles.picker}
              >
                <Picker.Item label="OCG" value="OCG" />
                <Picker.Item label="TCG" value="TCG" />
                <Picker.Item label="Genesys" value="Genesys" />
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
              >
                <Picker.Item label="Main Deck" value="main" />
                <Picker.Item label="Side Deck" value="side" />
              </Picker>
            </View>
          </View>
        </View>

        {/* Card Pool */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Pool</Text>
          <View style={styles.cardPoolScroll}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              onScroll={handleScroll}
              scrollEventThrottle={400}
            >
              <View style={styles.cardPoolGrid}>
                {cardPool.map((card) => (
                  <CardPoolItem
                    key={card.card_id}
                    card={card}
                    onAdd={(c) => addToDeck(c, filterType)}
                  />
                ))}
              </View>

              {isLoadingMore && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2196F3" />
                  <Text style={styles.loadingText}>
                    {isSearchMode ? 'Searching…' : 'Loading more…'}
                  </Text>
                </View>
              )}

              {!hasMoreCards && cardPool.length > 0 && !isSearchMode && (
                <Text style={styles.endOfListText}>No more cards</Text>
              )}

              {cardPool.length === 0 && searchQuery && !isLoadingMore && (
                <Text style={styles.noResultsText}>
                  No cards found for "{searchQuery}"
                </Text>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Main Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Main Deck</Text>
            <Text style={styles.sectionCount}>{deckCounts.main} cards</Text>
          </View>
          <View style={styles.deckContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(mainDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={() => addToDeck(card, 'main')}
                    onRemove={() => removeFromDeck(card, 'main')}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Extra Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Extra Deck</Text>
            <Text style={styles.sectionCount}>
              {deckCounts.extra}/15 cards
            </Text>
          </View>
          <View style={[styles.deckContainer, styles.smallDeckContainer]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(extraDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={() => addToDeck(card, 'extra')}
                    onRemove={() => removeFromDeck(card, 'extra')}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Side Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Side Deck</Text>
            <Text style={styles.sectionCount}>
              {deckCounts.side}/15 cards
            </Text>
          </View>
          <View style={[styles.deckContainer, styles.smallDeckContainer]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deckGrid}>
                {getDeckCards(sideDeck).map(({ card, count }) => (
                  <DeckCardItem
                    key={card.card_id}
                    card={card}
                    count={count}
                    onAdd={() => addToDeck(card, 'side')}
                    onRemove={() => removeFromDeck(card, 'side')}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleFilterApply}
        defaultFilters={activeFilters}
      />

    </ScrollView>
  );
};

/* --------------------------------------------------------------
   Styles
   -------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { paddingHorizontal: 20
, paddingTop: 50
  },
  center: { justifyContent: 'center', alignItems: 'center' },

  /* Header */
  backButton: { marginBottom: 20, paddingVertical: 5 },
  backText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a' },
  deckHeaderSection: { marginBottom: 16 },
  deckNameInput: {
    backgroundColor: '#fff',
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
  deckCountText: { fontSize: 13, color: '#666', fontWeight: '500' },

  /* Action buttons */
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },

  /* Save */
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonDisabled: { backgroundColor: '#9E9E9E' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  /* Search */
  searchRow: { marginBottom: 16 },
  searchContainer: {
    backgroundColor: '#fff',
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
  clearButton: { paddingHorizontal: 12, paddingVertical: 12 },
  clearButtonText: { fontSize: 18, color: '#999', fontWeight: '600' },
  searchModeText: { fontSize: 12, color: '#2196F3', marginTop: 4 },

  /* Controls */
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  formatPickerContainer: { flex: 1 },
  filterContainer: { flex: 1 },
  controlLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  picker: { width: '100%' },

  /* Sections */
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  sectionCount: { fontSize: 14, color: '#666', fontWeight: '500' },

  /* Card pool */
  cardPoolScroll: {
    maxHeight: 440,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  cardPoolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  cardPoolItem: { width: '23%', marginBottom: 8 },
  cardImageContainer: { aspectRatio: 0.686, marginBottom: 4 },
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
  cardImageText: { fontSize: 10, color: '#999', fontWeight: '600' },

  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: { fontSize: 12, color: '#666' },
  endOfListText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 16,
    fontStyle: 'italic',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 32,
  },

  /* Deck containers */
  deckContainer: {
    height: 500,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 8,
  },
  smallDeckContainer: { height: 200 },
  deckGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
filterIconButton: {
  width: 46,
  height: 46,
  backgroundColor: '#fff',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e0e0e0',
  alignItems: 'center',
  justifyContent: 'center',
},

});

export default DeckDetailPage;