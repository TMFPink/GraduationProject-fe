import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DeckCardItem from '@/components/ui/item-deck-card';
// Card component for the card pool
const CardPoolItem = ({ card, onAdd }) => (
  <TouchableOpacity style={styles.cardPoolItem} onPress={() => onAdd(card)}>
    <View style={styles.cardImageContainer}>
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardImageText}>IMG</Text>
      </View>
    </View>
    <Text style={styles.cardPoolName} numberOfLines={1}>{card.name}</Text>
  </TouchableOpacity>
);

const DeckDetailPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deckName, setDeckName] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('advanced');
  const [filterType, setFilterType] = useState('main'); // main, extra, spell, trap, etc.
  
  // Mock card pool data
  const [cardPool] = useState([
    { id: 1, name: 'Dark Magician', type: 'monster' },
    { id: 2, name: 'Blue-Eyes White Dragon', type: 'monster' },
    { id: 3, name: 'Pot of Greed', type: 'spell' },
    { id: 4, name: 'Mirror Force', type: 'trap' },
    { id: 5, name: 'Monster Reborn', type: 'spell' },
    { id: 6, name: 'Raigeki', type: 'spell' },
    { id: 7, name: 'Solemn Judgment', type: 'trap' },
    { id: 8, name: 'Ash Blossom', type: 'monster' },
    { id: 9, name: 'Dark Magician', type: 'monster' },
    { id: 10, name: 'Blue-Eyes White Dragon', type: 'monster' },
    { id: 11, name: 'Pot of Greed', type: 'spell' },
    { id: 12, name: 'Mirror Force', type: 'trap' },
    { id: 13, name: 'Monster Reborn', type: 'spell' },
    { id: 14, name: 'Raigeki', type: 'spell' },
    { id: 15, name: 'Solemn Judgment', type: 'trap' },
    { id: 16, name: 'Ash Blossom', type: 'monster' },
  ]);

  // Deck state
  const [mainDeck, setMainDeck] = useState({});
  const [extraDeck, setExtraDeck] = useState({});
  const [sideDeck, setSideDeck] = useState({});

  // Calculate deck counts
  const getMainDeckCount = () => Object.values(mainDeck).reduce((sum, count) => sum + count, 0);
  const getExtraDeckCount = () => Object.values(extraDeck).reduce((sum, count) => sum + count, 0);
  const getSideDeckCount = () => Object.values(sideDeck).reduce((sum, count) => sum + count, 0);

  // Add card to deck
  const addToDeck = (card, deckType) => {
    const setDeck = deckType === 'main' ? setMainDeck : deckType === 'extra' ? setExtraDeck : setSideDeck;
    const deck = deckType === 'main' ? mainDeck : deckType === 'extra' ? extraDeck : sideDeck;
    
    setDeck(prev => ({
      ...prev,
      [card.id]: Math.min((prev[card.id] || 0) + 1, 3)
    }));
  };

  // Remove card from deck
  const removeFromDeck = (card, deckType) => {
    const setDeck = deckType === 'main' ? setMainDeck : deckType === 'extra' ? setExtraDeck : setSideDeck;
    
    setDeck(prev => {
      const newCount = (prev[card.id] || 0) - 1;
      if (newCount <= 0) {
        const { [card.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [card.id]: newCount };
    });
  };

  // Get cards in deck with counts
  const getDeckCards = (deck) => {
    return Object.entries(deck).map(([cardId, count]) => ({
      card: cardPool.find(c => c.id === parseInt(cardId)),
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

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
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
                <Picker.Item label="Extra Deck" value="extra" />
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
            >
              <View style={styles.cardPoolGrid}>
                {cardPool.map((card) => (
                  <CardPoolItem 
                    key={card.id} 
                    card={card} 
                    onAdd={(card) => addToDeck(card, filterType)}
                  />
                ))}
              </View>
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
                    key={card.id}
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
                    key={card.id}
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
                    key={card.id}
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
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
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
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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

    maxHeight: 250,
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
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
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
  deckCardItem: {
    width: '18%',
    marginBottom: 8,
  },
  deckCardName: {
    fontSize: 9,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  cardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  controlButton: {
    width: 20,
    height: 20,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonDisabled: {
    backgroundColor: '#ccc',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 14,
  },
  controlCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    minWidth: 12,
    textAlign: 'center',
  },
});

export default DeckDetailPage;