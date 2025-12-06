import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import BinderCard from '@/components/ui/item-binder';
import FilterModal from '@/components/ui/modals/filterModal';
import { cardApi } from '@/src/api/card-api';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimer, setSearchTimer] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isDomainPickerVisible, setIsDomainPickerVisible] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('ygo');

  const [cards, setCards] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreCards, setHasMoreCards] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const CARDS_PER_PAGE = 20;

  const gameSeries = [
    {
      id: 1,
      name: 'Yu-Gi-Oh!',
      domain: 'ygo',
      logoUrl: require('@/assets/images/ygo_banner.png'),
      color: '#8B0000',
    },
    {
      id: 2,
      name: 'Pokémon',
      domain: 'pkm',
      logoUrl: require('@/assets/images/pkm_banner.png'),
      color: '#FFCB05',
    },
    // {
    //   id: 3,
    //   name: 'Magic: The Gathering',
    //   domain: 'mtg',
    //   logoUrl: { uri: 'https://www.icomedia.eu/wp-content/uploads/2021/03/MTG_Primary_LL_1c_Black_LG_V12.png' }, // Note: If you uncomment this, wrap remote URLs in { uri: ... } inside the array itself
    //   color: '#F15A24',
    // },
    // {
    //   id: 4,
    //   name: 'Gundam',
    //   domain: 'gundam',
    //   logoUrl: { uri: 'https://travellingman.com/cdn/shop/files/gundam-card-game-newtype-rising-booster-box-gd01-499905_1200x1200.webp?v=1756386542' },
    //   color: '#1a1a1a',
    // },
    {
      id: 5,
      name: 'Riftbound',
      domain: 'rb',
      logoUrl: require('@/assets/images/rb_banner.png'),
      color: '#1a1a1a',
    },
  ];

  const loadCards = async (page = 1, append = false, query = '', filters = {}, domain = selectedDomain) => {
    if (isLoadingMore && append) return;
    append ? setIsLoadingMore(true) : setIsLoading(true);

    try {
      const filtersWithDomain = {
        ...filters,
        domain: domain,
      };

      const response = await cardApi.getMetadataCard(
        query ? 1000 : CARDS_PER_PAGE,
        page,
        query,
        filtersWithDomain
      );

      if (response.statusCode === 200 && response.metadata?.cards) {
        const newCards = response.metadata.cards.map(card => ({
          ...card,
          domain: domain,
        }));
        
        console.log(`Loaded ${newCards.length} cards for domain: ${domain}`);
        setHasMoreCards(!query && newCards.length === CARDS_PER_PAGE);
        setCards(append ? (prev) => [...prev, ...newCards] : newCards);
      } else {
        setCards([]);
        setHasMoreCards(false);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setCards([]);
      setHasMoreCards(false);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const performSearch = (text, filters = {}) => {
    const trimmed = text.trim();
    setIsSearchMode(!!trimmed);
    setCurrentPage(1);
    setHasMoreCards(!trimmed);
    loadCards(1, false, trimmed, filters);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => performSearch(text, activeFilters), 400);
    setSearchTimer(timer);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    setCurrentPage(1);
    setHasMoreCards(true);
    loadCards(1, false, '', activeFilters);
  };

  const handleFilterApply = (newFilters) => {
    setActiveFilters(newFilters);
    performSearch(searchQuery, newFilters);
  };

  const handleDomainChange = (game) => {
    setSelectedDomain(game.domain);
    setIsDomainPickerVisible(false);
    setCurrentPage(1);
    setSearchQuery('');
    setIsSearchMode(false);
    loadCards(1, false, '', activeFilters, game.domain);
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMoreCards && !isSearchMode) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadCards(nextPage, true, searchQuery, activeFilters);
    }
  };

  useEffect(() => {
    loadCards(1, false);
  }, []);

  const handleCardPress = (card) => {
    router.navigate({
      pathname: '/cardDetail',
      params: { card: JSON.stringify(card) },
    });
  };

  const renderCard = ({ item }) => (
    <BinderCard
      image={item.image_normal_url || item.card_images?.[0]?.image_url}
      name={item.name}
      setName={item.set_name || item.card_sets?.[0]?.set_name || 'N/A'}
      qty={1}
      price={item.card_prices?.[0]?.tcgplayer_price || '0.00'}
      onPress={() => handleCardPress(item)}
    />
  );

  const renderFooter = () =>
    isLoadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#EA6C5D" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    ) : null;

  const renderEmpty = () =>
    !isLoading ? (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="card-search-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>
          {isSearchMode
            ? `No cards found for "${searchQuery}"`
            : 'No cards available'}
        </Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Cards</Text>

        <TouchableOpacity 
          style={styles.domainPickerButton}
          onPress={() => setIsDomainPickerVisible(true)}
        >
          {/* FIX START: Removed { uri: ... } wrapper because require() returns a number ID */}
          <Image 
            source={gameSeries.find(g => g.domain === selectedDomain)?.logoUrl}
            style={styles.domainPickerLogo}
            resizeMode="contain"
          />
          {/* FIX END */}
          <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={22} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cards by name..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
            />
            {searchQuery ? (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => router.navigate('/cameraScan')}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={24} color="#EA6C5D" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconButton,
              Object.keys(activeFilters).length > 0 && styles.iconButtonActive,
            ]}
            onPress={() => setIsFilterModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={24}
              color={Object.keys(activeFilters).length > 0 ? '#fff' : '#EA6C5D'}
            />
            {Object.keys(activeFilters).length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {Object.keys(activeFilters).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA6C5D" />
          <Text style={styles.loadingText}>Loading cards...</Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item, index) => `${item.card_id || item.id}-${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}

      {console.log('Active filters being passed to modal:', activeFilters)}
      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={handleFilterApply}
        defaultFilters={activeFilters}
        domain={selectedDomain}
      />

      <Modal
        visible={isDomainPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDomainPickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDomainPickerVisible(false)}
        >
          <View style={styles.domainPickerModal}>
            <View style={styles.domainPickerHeader}>
              <Text style={styles.domainPickerTitle}>Select Game Series</Text>
              <TouchableOpacity onPress={() => setIsDomainPickerVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.domainPickerList}>
              {gameSeries.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[
                    styles.domainPickerItem,
                    selectedDomain === game.domain && styles.domainPickerItemActive,
                  ]}
                  onPress={() => handleDomainChange(game)}
                >
                  <Image 
                    source={game.logoUrl}
                    style={styles.domainPickerItemLogo}
                    resizeMode="contain"
                  />
                  <View style={styles.domainPickerItemTextContainer}>
                    <Text style={styles.domainPickerItemName}>{game.name}</Text>
                  </View>
                  {selectedDomain === game.domain && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  domainPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  domainPickerLogo: {
    width: '100%',
    height: 100,
  },
  domainPickerButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  domainPickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  domainPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  domainPickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  domainPickerList: {
    padding: 16,
  },
  domainPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  domainPickerItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  domainPickerItemLogo: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  domainPickerItemTextContainer: {
    flex: 1,
  },
  domainPickerItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  iconButton: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EA6C5D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonActive: {
    backgroundColor: '#EA6C5D',
    borderColor: '#EA6C5D',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#10B981',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  flatListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 100,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});