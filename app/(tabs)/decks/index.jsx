// DeckPage.jsx
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { gameSeries } from '@/constants/gameSeries'; // ✅ Import shared config

const DeckPage = () => {
  // ✅ Pass selected series domain to DeckListPage
  const navigateToDeckList = (series) => {
  // 🐛 DEBUG: Log what we're sending
  console.log('=== DeckPage Debug ===');
  console.log('Selected series:', series);
  console.log('Sending seriesDomain:', series.domain); // Should be 'domain' not 'card_type'
  
  router.push({
    pathname: '/decks/deckList',
    params: { 
      seriesDomain: series.domain,  // ✅ CHANGE back to series.domain
      seriesName: series.name,
      seriesLogo: series.logoUrl,
    }
  });
};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Deck</Text>
        <Text style={styles.subtitle}>Choose a series to manage your decks</Text>
        
        <View style={styles.seriesList}>
          {gameSeries.map((series) => (
            <TouchableOpacity
              key={series.id}
              onPress={() => navigateToDeckList(series)} // ✅ Pass series object
              style={[styles.seriesCard, { backgroundColor: series.color }]}
            >
              {/* ✅ Show logo */}
              <Image 
                source={{ uri: series.logoUrl }} 
                style={styles.seriesLogo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  seriesList: {
    gap: 16,
  },
  seriesCard: {
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
  },
  seriesLogo: {
    width: '80%',
    height: '80%',
  },
});

export default DeckPage;