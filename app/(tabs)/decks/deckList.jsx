import React, { useEffect, useState, useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, ScrollView, 
  TextInput, Image, ActivityIndicator, Alert, Modal 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ItemDeck from '../../../components/ui/item-deck';
import { deckApi } from '@/src/api/deck-api';

// ✅ Map frontend domains to backend domains for filtering
const FRONTEND_TO_BACKEND_DOMAIN = {
  'ygo': 'yugioh',
  'pkm': 'pokemon',
  'mtg': 'magic',
};

// ✅ FIX START: Define Logo Map locally to avoid passing assets via params
const LOGO_MAP = {
  'ygo': require('@/assets/images/ygo_banner.png'),
  'pkm': require('@/assets/images/pkm_banner.png'),
  'rb': require('@/assets/images/rb_banner.png'),
  // Add others if needed
};
// ✅ FIX END

const DeckListPage = () => {
  const params = useLocalSearchParams();
  const seriesDomain = params.seriesDomain || 'ygo';
  const seriesName = params.seriesName || 'Yu-Gi-Oh!';
  
  // ✅ FIX: Resolve the logo source directly. 
  // If it exists in LOGO_MAP, use it (returns a number ID). 
  // Otherwise, fallback to a remote URL object.
  const seriesLogoSource = LOGO_MAP[seriesDomain] 
    ? LOGO_MAP[seriesDomain] 
    : { uri: 'https://www.yugioh-card.com/en/wp-content/uploads/2020/04/logo-main.png' };

  const [searchQuery, setSearchQuery] = useState('');
  const [allDecks, setAllDecks] = useState([]);
  const [loading, setLoading] = useState(true);
   
  // ✅ Multi-select delete states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deckApi.getAllDecks(1, 100);
      const decks = response.metadata.decks || [];
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

  // ✅ Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Exit edit mode - clear selections
      setSelectedDecks(new Set());
    }
    setIsEditMode(!isEditMode);
  };

  // ✅ Toggle deck selection
  const toggleDeckSelection = (deckId) => {
    setSelectedDecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  };

  // ✅ Handle delete selected decks
  const handleDeleteSelected = () => {
    if (selectedDecks.size === 0) {
      Alert.alert('No Selection', 'Please select decks to delete.');
      return;
    }
    setShowDeleteModal(true);
  };

  // ✅ Confirm and execute deletion
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    try {
      // Delete all selected decks
      await Promise.all(
        Array.from(selectedDecks).map(deckId => deckApi.deleteDeck(deckId))
      );

      // Remove deleted decks from state
      setAllDecks(prev => prev.filter(deck => !selectedDecks.has(deck.deck_id)));
      
      // Exit edit mode
      setIsEditMode(false);
      setSelectedDecks(new Set());

      Alert.alert('Success', `${selectedDecks.size} deck(s) deleted successfully.`);
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete some decks.');
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Single deck delete (when not in edit mode)
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
      const defaultDeck = {
        name: 'New Deck',
        card_type: seriesDomain,
        format: 'OCG',
        cards: [],
      };

      const response = await deckApi.createDeck(defaultDeck);
      const createdDeck = response?.metadata?.deck;

      if (createdDeck && createdDeck.deck_id) {
        await loadDecks();
        
        router.navigate({
          pathname: '/decks/deckDetail',
          params: { 
            deckId: createdDeck.deck_id
          },
        });
      } else {
        Alert.alert('Error', 'Failed to create new deck.');
      }
    } catch (error) {
      console.error('Error creating deck:', error);
      Alert.alert('Error', 'Unable to create new deck.');
    }
  };

  const handleBack = () => router.back('/decks');
   
  const handleDeckPress = (deck) => {
    if (isEditMode) {
      // In edit mode - toggle selection
      toggleDeckSelection(deck.deck_id);
    } else {
      // Normal mode - navigate to detail
      router.push({ 
        pathname: '/decks/deckDetail', 
        params: { 
          deckId: deck.deck_id 
        } 
      });
    }
  };

  // ✅ Filter decks
  const filteredDecks = allDecks.filter(deck => {
    const deckDomain = deck.domain?.domain;
    const expectedDomain = FRONTEND_TO_BACKEND_DOMAIN[seriesDomain] || seriesDomain;
    const matchesSeries = deckDomain === expectedDomain;
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeries && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* ===== Fixed Header Section ===== */}
      <View style={styles.fixedHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>{'< Deck'}</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          {/* ✅ FIX: Passed direct source object/number */}
          <Image 
            source={seriesLogoSource} 
            style={styles.seriesLogo} 
            resizeMode="contain" 
          />
        </View>

        {/* ✅ Search + Edit Button */}
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

          {/* ✅ Edit/Delete Mode Button */}
          <TouchableOpacity 
            style={[styles.editButton, isEditMode && styles.editButtonActive]}
            onPress={toggleEditMode}
          >
            <MaterialCommunityIcons 
              name={isEditMode ? "close" : "trash-can-outline"} 
              size={22} 
              color={isEditMode ? "#fff" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===== Fixed "Decks" Header ===== */}
      <View style={styles.fixedDecksHeader}>
        <Text style={styles.deckCountText}>
          {loading ? '0' : filteredDecks.length} deck{filteredDecks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* ===== Scrollable Decks Section ===== */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.decksContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#555" />
            </View>
          ) : (
            <>
              <View style={styles.deckGrid}>
                <ItemDeck 
                  name="Create Deck"
                  isCreateNew={true}
                  onPress={handleCreateDeck}
                />

                {filteredDecks.map((deck) => {
                  // ✅ Construct the images array from API response
                  const deckImages = [
                    deck.first_card_image,
                    deck.second_card_image,
                    deck.third_card_image
                  ].filter(img => img !== null && img !== undefined && img !== '');

                  return (
                    <View key={deck.deck_id} style={styles.deckWrapper}>
                      {/* ✅ Checkbox (only in edit mode) */}
                      {isEditMode && (
                        <View style={styles.checkboxContainer}>
                          <TouchableOpacity
                            style={[
                              styles.checkbox,
                              selectedDecks.has(deck.deck_id) && styles.checkboxSelected
                            ]}
                            onPress={() => toggleDeckSelection(deck.deck_id)}
                          >
                            {selectedDecks.has(deck.deck_id) && (
                              <MaterialCommunityIcons name="check" size={16} color="#fff" />
                            )}
                          </TouchableOpacity>
                        </View>
                      )}

                      <ItemDeck
                        name={deck.name}
                        images={deckImages} // ✅ Pass the array of 3 images
                        onPress={() => handleDeckPress(deck)}
                        onDelete={!isEditMode ? () => handleDelete(deck.deck_id) : undefined}
                        isEditMode={isEditMode}
                      />
                    </View>
                  );
                })}
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

          <View style={styles.scrollableBottomPadding} />
        </View>
      </ScrollView>

      {/* ✅ Delete Selected Button (floating above bottom nav) */}
      {isEditMode && selectedDecks.size > 0 && (
        <TouchableOpacity 
          style={styles.deleteSelectedButton}
          onPress={handleDeleteSelected}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="trash-can" size={20} color="#fff" />
              <Text style={styles.deleteSelectedText}>
                Delete ({selectedDecks.size})
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* ✅ Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#EF4444" />
            </View>
            
            <Text style={styles.modalTitle}>Delete Decks?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedDecks.size} deck{selectedDecks.size !== 1 ? 's' : ''}?
              {'\n'}This action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonTextDelete}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },

  // ===== Fixed Header =====
  fixedHeader: {
    backgroundColor: '#212121',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
  },

  backButton: {
    marginBottom: 14,
    paddingVertical: 5,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F2CC0F',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  seriesLogo: {
    width: 200,
    height: 70,
    // marginBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#212121',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#F2CC0F',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F2CC0F',
  },

  // ✅ Edit button
  editButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F2CC0F',
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#F2CC0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },

  // ===== Fixed Decks Header =====
  fixedDecksHeader: {
    backgroundColor: '#212121',
    paddingHorizontal: 20,
    paddingVertical: 12,
    zIndex: 5,
  },

  deckCountText: {
    fontSize: 14,
    color: '#F2CC0F',
    fontWeight: '500',
  },

  // ===== Scrollable Content =====
  scrollableContent: {
    flex: 1,
  },
  decksContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scrollableBottomPadding: {
    height: 120,
  },

  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },

  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },

  // ✅ Deck wrapper with checkbox
  deckWrapper: {
    position: 'relative',
  },
  checkboxContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  // ✅ Delete selected button
  deleteSelectedButton: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteSelectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

  // ✅ Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#212121',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f3f4f6',
  },
  modalButtonDelete: {
    backgroundColor: '#EF4444',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DeckListPage;