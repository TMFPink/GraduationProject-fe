import React, { useRef, useState, useEffect, useFocusEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Posts from "@/components/ui/post";
import { SafeAreaView } from "react-native-safe-area-context";
import BinderCard from "@/components/ui/item-binder";
import { collectionApi } from '@/src/api/collection-api';
import { ownedCardApi } from '@/src/api/ownedcard-api';
import ItemDeck from '../../components/ui/item-deck';


const TABS = ["Posts", "Portfolio", "Collections"];

const ProfileScreen = () => {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const [ownedCards, setOwnedCards] = useState([]);
  const [myBinders, setMyBinders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);


  const [cardData] = useState([])
  const [userPosts] = useState([
    {
      id: "1",
      authorId: "user-123",
      authorName: "Username",
      createdAt: "Oct 20, 2025",
      content: "Just shared my latest project! Check it out 🎨",
      likesCount: 145,
      commentsCount: 23,
    },
    {
      id: "2",
      authorId: "user-123",
      authorName: "Username",
      createdAt: "Oct 18, 2025",
      content: "Excited to announce my new collection is now live! 🚀",
      likesCount: 289,
      commentsCount: 41,
    },
    {
      id: "3",
      authorId: "user-123",
      authorName: "Username",
      createdAt: "Oct 15, 2025",
      content: "Thanks for all the support! Hit level 36 today 🎉",
      likesCount: 512,
      commentsCount: 78,
    },
  ]);

  const handleTabPress = (index) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveTab(index);
  };



  // Fetch owned cards and collections
  const fetchCollection = async () => {
    try {
      setLoading(true);
      
      // Fetch owned cards using ownedCardApi
      const ownedResponse = await ownedCardApi.getAllOwnedCards(1, 100);
      const ownedCardsData = ownedResponse.metadata?.ownedCards || [];
      setOwnedCards(ownedCardsData);
      
      // Fetch custom binders (collections)
      const collectionsResponse = await collectionApi.getAllCollection(1, 100);
      const collections = collectionsResponse.metadata?.collections || collectionsResponse.collections || [];
      
      // Filter out any "Owned Cards" collection if it exists (we don't need it anymore)
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
    fetchCollection();
  }, []);

  // Refetch when page gains focus
  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchData();
  //   }, [])
  // );

  const handleCollectionPress = (binder) => {
    router.push({ 
      pathname: '/collections/collectionDetail', 
      params: { 
        collectionId: binder.collection_id 
      } 
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1503264116251-35a269479413",
            }}
            style={styles.coverImage}
          />
          <TouchableOpacity
            style={[
              styles.editButton,
              {
                position: "absolute",
                right: 16,
                bottom: 16,
                backgroundColor: "white",
              },
            ]}
          >
            <Text style={styles.editText}>Edit Info</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Row */}
        <View style={styles.profileRow}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
            }}
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>Username</Text>
            <View style={styles.levelTag}>
              <Text style={styles.levelText}>Lv. 36</Text>
            </View>
          </View>

          <Text style={styles.userTag}>@username_xyz</Text>
          <Text style={styles.bio}>Bio ja kasjdkjkd</Text>
          <Text style={styles.link}>https://shopabcxyz.xyz</Text>

          <View style={styles.followRow}>
            <Text style={styles.followText}>
              <Text style={styles.bold}>420</Text> Followers
            </Text>
            <Text style={styles.followText}>
              <Text style={styles.bold}>69</Text> Following
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {TABS.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(index)}
              style={styles.tabButton}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: scrollX.interpolate({
                      inputRange: [0, width * (TABS.length - 1)],
                      outputRange: [0, (width / 3) * (TABS.length - 1)],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>

        {/* Tab Content */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
        >
          {/* Posts */}
          <View style={{ width }}>
            {userPosts.map((post) => (
              <Posts key={post.id} post={post} />
            ))}
          </View>

          {/* Portfolio */}
          <View style={[styles.tabPage, { width }]}>
            {/* Featured cards */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <Text style={styles.tabHeader}>Featured Cards</Text>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.deckContainer, styles.smallDeckContainer]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.deckGrid}></View>
              </ScrollView>
            </View>

            {/* Main Portfolio */}
            <Text style={styles.tabHeader}>Main Portfolio</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {cardData.map((item) => (
                <View key={item.id}>
                  <BinderCard
                    image={item.image}
                    name={item.name}
                    setName={item.setName}
                    qty={item.qty}
                    price={item.price}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Collections */}
          <View style={[styles.tabPage, { width }]}>
            <Text style={styles.tabHeader}>Collections</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {myBinders.map((binder) => (
                <ItemDeck 
                  key={binder.collection_id}
                  name={binder.name}
                  collectionId={binder.collection_id}
                  onPress={() => handleCollectionPress(binder)}
                  onDelete={() => handleDeleteBinder(binder.collection_id)}
                />
              ))}
            </View>          
          </View>
        </Animated.ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  coverContainer: { width: "100%", height: 120 },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginTop: -30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    paddingHorizontal: 16,
    marginBottom: 50,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  username: { fontSize: 18, fontWeight: "700", color: "#222" },
  levelTag: {
    backgroundColor: "#eee",
    borderRadius: 6,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelText: { fontSize: 12, color: "#333", fontWeight: "600" },
  userTag: { color: "#666", fontSize: 14, marginBottom: 4 },
  bio: { color: "#444", fontSize: 14 },
  link: { color: "#1a73e8", fontSize: 14, marginTop: 4 },
  followRow: {
    flexDirection: "row",
    marginTop: 6,
    gap: 12,
  },
  followText: { fontSize: 14, color: "#555" },
  bold: { fontWeight: "700", color: "#000" },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    alignSelf: "flex-start",
  },
  editText: { fontSize: 13, color: "#333" },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
    marginTop: 10,
  },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 15, color: "#888" },
  tabTextActive: { color: "#000", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: "#000",
    borderRadius: 2,
  },
  tabPage: {
    padding: 16,
  },
  tabHeader: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  tabContent: { fontSize: 15, color: "#555" },

  deckContainer: {
    height: 500,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 8,
  },
  smallDeckContainer: {
    height: 200,
  },
});
