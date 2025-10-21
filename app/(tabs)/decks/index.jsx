import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const DeckPage = () => {
  const series = [
    { id: 1, name: 'Yu-Gi-Oh!', color: '#8B0000' },
    { id: 2, name: 'Pokémon', color: '#FFCB05' },
    { id: 3, name: 'Magic: The Gathering', color: '#F15A24' },
    { id: 4, name: 'Gundam Card Game', color: '#1a1a1a' },
  ];

  const navigateToDeckList = () => {
    router.push('/decks/deckList');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Deck</Text>
        <Text style={styles.subtitle}>Series</Text>

        <View style={styles.seriesList}>
          {series.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={navigateToDeckList}
              style={[styles.seriesCard, { backgroundColor: item.color }]}
            >
              <Text style={styles.seriesName}>{item.name}</Text>
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
  },
  seriesName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default DeckPage;
