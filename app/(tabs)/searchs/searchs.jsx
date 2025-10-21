import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CardGridItem from '../../../components/ui/cardGridItem';
// import newCollectionData from '../../../assets/data/newCollection.json';

const Search = () => {
  const [searchText, setSearchText] = useState('');
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);

//   useEffect(() => {
//     setCards(newCollectionData);
//     setFilteredCards(newCollectionData);
//   }, []);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredCards(cards);
    } else {
      const filtered = cards.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCards(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.iconButton}>
          <MaterialCommunityIcons name="scan-helper" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredCards}
        renderItem={({ item }) => (
          <CardGridItem
            image={item.image}
            name={item.name}
            setName={item.category}
            rarity={item.edition}
            number={item.price}
            onPress={() => console.log('Tapped:', item.name)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EA6C5D',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});