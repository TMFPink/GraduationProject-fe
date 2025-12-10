import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, TextInput, Image, ActivityIndicator, Alert, Modal  
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import ItemDeck from '../../../components/ui/item-deck';
import { collectionApi } from '@/src/api/collection-api';
import { ownedCardApi } from '@/src/api/ownedcard-api';

const CollectionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [ownedCards, setOwnedCards] = useState([]);
  const [myBinders, setMyBinders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Multi-select delete states
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBinders, setSelectedBinders] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      
      // Filter out any "Owned Cards" collection if it exists
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

  // ✅ Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // Exit edit mode - clear selections
      setSelectedBinders(new Set());
    }
    setIsEditMode(!isEditMode);
  };

  // ✅ Toggle binder selection
  const toggleBinderSelection = (binderId) => {
    setSelectedBinders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(binderId)) {
        newSet.delete(binderId);
      } else {
        newSet.add(binderId);
      }
      return newSet;
    });
  };

  // ✅ Handle delete selected binders
  const handleDeleteSelected = () => {
    if (selectedBinders.size === 0) {
      Alert.alert('No Selection', 'Please select binders to delete.');
      return;
    }
    setShowDeleteModal(true);
  };

  // ✅ Confirm and execute deletion
  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    try {
      // Delete all selected binders
      await Promise.all(
        Array.from(selectedBinders).map(binderId => collectionApi.deleteCollection(binderId))
      );

      // Remove deleted binders from state
      setMyBinders(prev => prev.filter(binder => !selectedBinders.has(binder.collection_id)));
      
      // Exit edit mode
      setIsEditMode(false);
      setSelectedBinders(new Set());

      Alert.alert('Success', `${selectedBinders.size} binder(s) deleted successfully.`);
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete some binders.');
    } finally {
      setIsDeleting(false);
    }
  };

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

  // ✅ Single binder delete (when not in edit mode)
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
    if (isEditMode) {
      // In edit mode - toggle selection
      toggleBinderSelection(binder.collection_id);
    } else {
      // Normal mode - navigate to detail
      router.push({ 
        pathname: '/collections/collectionDetail', 
        params: { 
          collectionId: binder.collection_id 
        } 
      });
    }
  };

  // Filter binders by search
  const filteredBinders = myBinders.filter(binder =>
    binder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ===== Fixed Header Section ===== */}
      <View style={styles.fixedHeader}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Collection</Text>
        </View>

        {/* Search Bar + Edit Button */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#F2CC0F"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
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

        {/* Owned Cards Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>Owned Cards</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
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
                const card = ownedCard.Card;
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
                    {ownedCard.quantity > 1 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>x{ownedCard.quantity}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>

      {/* ===== Fixed "My Binders" Header ===== */}
      <View style={styles.fixedBindersHeader}>
        <Text style={styles.sectionHeaderText}>My Binders</Text>
      </View>

      {/* ===== Scrollable Binders Section ===== */}
      <ScrollView 
        style={styles.scrollableContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bindersContent}>
          <View style={styles.deckGrid}>
            <ItemDeck 
              name="Create Binder"
              isCreateNew={true}
              onPress={handleCreateBinder}
            />
            {filteredBinders.map((binder) => {
                // ✅ Construct the images array similar to DeckList
                // We check for specific fields first, then fallback to 'cards' array if it exists
                let binderImages = [];
                
                if (binder.first_card_image) binderImages.push(binder.first_card_image);
                if (binder.second_card_image) binderImages.push(binder.second_card_image);
                if (binder.third_card_image) binderImages.push(binder.third_card_image);
                
                // Fallback: if no specific image fields, try to get from cards array
                if (binderImages.length === 0 && binder.cards && Array.isArray(binder.cards)) {
                    binderImages = binder.cards
                        .slice(0, 3)
                        .map(c => c.image_normal_url || c.image_small_url || c.image);
                }

                // Fallback: if legacy single image exists
                if (binderImages.length === 0 && binder.image) {
                   binderImages.push(binder.image);
                }

                return (
                  <View key={binder.collection_id} style={styles.binderWrapper}>
                    {/* ✅ Checkbox (only in edit mode) */}
                    {isEditMode && (
                      <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            selectedBinders.has(binder.collection_id) && styles.checkboxSelected
                          ]}
                          onPress={() => toggleBinderSelection(binder.collection_id)}
                        >
                          {selectedBinders.has(binder.collection_id) && (
                            <MaterialCommunityIcons name="check" size={16} color="#fff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}

                    <ItemDeck 
                      name={binder.name}
                      images={binderImages} // ✅ Pass the array of images for the effect
                      collectionId={binder.collection_id}
                      onPress={() => handleCollectionPress(binder)}
                      onDelete={!isEditMode ? () => handleDeleteBinder(binder.collection_id) : undefined}
                      isEditMode={isEditMode}
                    />
                  </View>
                );
            })}
          </View>
          <View style={styles.scrollableBottomPadding} />
        </View>
      </ScrollView>

      {/* ✅ Delete Selected Button (floating above bottom nav) */}
      {isEditMode && selectedBinders.size > 0 && (
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
                Delete ({selectedBinders.size})
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
            
            <Text style={styles.modalTitle}>Delete Binders?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {selectedBinders.size} binder{selectedBinders.size !== 1 ? 's' : ''}?
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

export default CollectionPage;

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

  // ===== Fixed "My Binders" Header =====
  fixedBindersHeader: {
    backgroundColor: '#212121',
    paddingHorizontal: 20,
    paddingVertical: 12,

    zIndex: 5,
  },

  // ===== Scrollable Content =====
  scrollableContent: {
    flex: 1,
  },
  bindersContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  scrollableBottomPadding: {
    height: 120,
  },

  // ===== Header =====
  headerRow: {
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F2CC0F',
  },

  // ✅ Search Bar + Edit Button
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#212121',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#F2CC0F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F2CC0F',
  },
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

  // ===== Section Header =====
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewAllButton: {
    backgroundColor: '#F2CC0F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    color: '#212121',
    fontSize: 14,
    fontWeight: '500',
  },

  // ===== Deck Containers =====
  deckContainer: {
    backgroundColor: '#212121',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#F2CC0F',
    padding: 12,
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

  // ✅ Binder wrapper with checkbox
  binderWrapper: {
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
    // elevation: 8,
  },
  deleteSelectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#212121',
  },
  // Quantity Badge
  quantityBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F2CC0F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  quantityText: {
    color: '#212121',
    fontSize: 12,
    fontWeight: '700',
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