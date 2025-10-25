import Posts from '@/components/ui/post';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const ANNOUNCEMENT_WIDTH = width * 0.8;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [newCollection, setNewCollection] = useState([
    {
      id: '1',
      name: 'EcoSmart Lamp',
      category: 'Lighting',
      edition: 'Premium',
      price: '$39.99',
    },
    {
      id: '2',
      name: 'Bamboo Speaker',
      category: 'Audio',
      edition: 'Classic',
      price: '$59.99',
    },
    {
      id: '3',
      name: 'Solar Charger',
      category: 'Accessories',
      edition: 'Compact',
      price: '$29.99',
    },
  ]);

  const [newsItems, setNewsItems] = useState([
    {
      id: '1',
      authorId: 'author-1',
      authorName: 'Vitaluxe Official',
      createdAt: 'Oct 15, 2025',
      updatedAt: 'Oct 15, 2025',
      content: 'We just launched our new eco-friendly enzyme cleaner! 🌱',
      likesCount: 230,
      commentsCount: 18,
    },
    {
      id: '2',
      authorId: 'author-2',
      authorName: 'Homecare Daily',
      createdAt: 'Oct 10, 2025',
      updatedAt: 'Oct 10, 2025',
      content:
        'Learn why enzyme-based cleaning is revolutionizing the industry.',
      likesCount: 180,
      commentsCount: 22,
    },
  ]);

  const announcements = [
    {
      id: '1',
      title: 'Holiday Discount!',
      description:
        'Enjoy up to 30% off on all Vitaluxe products until November 30.',
    },
    {
      id: '2',
      title: 'New Store Opening',
      description:
        'Were expanding! Visit our new flagship store in District 1.',
    },
    {
      id: '3',
      title: 'Join Our Eco Challenge',
      description:
        'Participate in our #CleanWithEnzyme challenge to win free gifts!',
    },
  ];

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % announcements.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImagePlaceholder}>
        <MaterialCommunityIcons name="image" size={40} color="#ccc" />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productEdition}>{item.edition}</Text>
        <Text style={styles.productPrice}>{item.price}</Text>
      </View>
    </View>
  );

  const renderNewsItem = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postUsername}>{item.authorName}</Text>
      <Text style={styles.postDate}>{item.createdAt}</Text>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postStat}>❤️ {item.likesCount}</Text>
        <Text style={styles.postStat}>💬 {item.commentsCount}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.background, { backgroundColor: colors.tint }]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔵 Header Section */}
        <View style={styles.headerWrapper}>
          <View style={styles.headingRow}>
            <Text style={styles.headingText}>Welcome</Text>
            <Text style={styles.dateText}>!</Text>
          </View>

          {/* 🔔 Announcements Carousel */}
          <View style={styles.announcementsContainer}>
            <FlatList
              ref={flatListRef}
              data={announcements}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.announcementCard}>
                  <MaterialCommunityIcons
                    name="bullhorn-outline"
                    size={26}
                    color={colors.tint}
                  />
                  <Text style={[styles.announcementTitle, { color: colors.tint }]}>
                    ANNOUNCEMENT
                  </Text>
                  <Text style={styles.announcementSubtitle}>{item.title}</Text>
                  <Text style={styles.announcementDescription}>
                    {item.description}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* ⚪ Main Content */}
        <View style={styles.contentWrapper}>
          {/* 🟢 New Collection */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Collection</Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newCollection}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />

          {/* 📰 News Section */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>News</Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={newsItems}
            renderItem={({ item }) => (
              <Posts
                post={item}
              />
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    backgroundColor: '#E9F3FF',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    fontWeight: '600',
    color: '#003366',
  },
  announcementsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  announcementCard: {
    width: ANNOUNCEMENT_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginHorizontal: (width - ANNOUNCEMENT_WIDTH) / 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  announcementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  announcementSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
  },
  announcementDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 4,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewButton: {
    backgroundColor: '#E9F3FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#003366',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F4F8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#003366' },
  productCategory: { fontSize: 14, color: '#666', marginTop: 4 },
  productEdition: { fontSize: 14, color: '#666', marginTop: 2 },
  productPrice: { fontSize: 16, fontWeight: '600', color: '#0A3981', marginTop: 6 },

  // 📰 Post Styles
  postCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  postUsername: { fontSize: 14, fontWeight: 'bold', color: '#0A3981' },
  postDate: { fontSize: 12, color: '#777', marginBottom: 6 },
  postContent: { fontSize: 14, color: '#333', marginBottom: 8 },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postStat: { fontSize: 13, color: '#555' },
});