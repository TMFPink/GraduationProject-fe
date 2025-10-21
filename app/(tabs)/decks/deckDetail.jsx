import React, {useState} from 'react'
import { View, Text, StyleSheet, TouchableOpacity,TextInput ,ScrollView} from 'react-native'
import { router } from 'expo-router';
import ItemDeck from '../../../components/ui/item-deck';
import { Picker } from '@react-native-picker/picker';



const DeckDetailPage = () => {
      const [searchQuery, setSearchQuery] = useState('');
      const [deck, setDeck] = useState(null);  

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


        <View>
            <TextInput style={styles.searchInput}
              placeholder="Deck Name"
              value={deck ? deck.name : ''}
              onChangeText={setDeck}
              placeholderTextColor="#999"
            >
            </TextInput>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:10}}   >
                <TouchableOpacity>
                    <Text>Import File</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text>Save</Text>
                </TouchableOpacity>
            </View>
            
        </View>



        {/* Search Bar with Delete Icon */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {}
        
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
  backButton: {
    marginBottom: 20,
    paddingVertical: 5,
  },
  backText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  seriesLogo: {
    width: 200,
    height: 80,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
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
  deleteButton: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 20,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
});

export default DeckDetailPage
