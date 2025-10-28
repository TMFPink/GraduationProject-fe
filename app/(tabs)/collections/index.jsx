// screens/CollectionPage.jsx
import React, { useState } from 'react';
import { router } from 'expo-router';
import { 
  StyleSheet, View, Text, TouchableOpacity, 
  ScrollView, TextInput   
} from 'react-native';
import ItemDeck from '../../../components/ui/item-deck';

const CollectionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

        {/* ===== Featured Product Section ===== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>Owned Cards</Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>View</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.deckContainer, styles.featuredDeckContainer]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.deckGrid}>
              {/* Future featured items here */}
            </View>
          </ScrollView>
        </View>

        {/* ===== My Collection ===== */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderText}>My Binders</Text>
        </View>

        <View style={styles.deckGrid}>
          <ItemDeck 
            name="Create Binder"
            isCreateNew={true}
          />
          <ItemDeck name="My First Binder" />
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
});
