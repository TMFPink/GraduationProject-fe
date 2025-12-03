  import React, { useRef, useState, useEffect } from "react";
  import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    useWindowDimensions,
    ActivityIndicator,
  } from "react-native";
  import Posts from "@/components/ui/post";
  import { SafeAreaView } from "react-native-safe-area-context";
  import BinderCard from "@/components/ui/item-binder";
  import { collectionApi } from '@/src/api/collection-api';
  import { ownedCardApi } from '@/src/api/ownedcard-api';
  import { postApi } from '@/src/api/post-api';
  import ItemDeck from '../../../components/ui/item-deck';
  import { useRouter } from 'expo-router';
  import { useAuth } from '@/src/contexts/auth-context';


  const TABS = ["Posts", "Portfolio", "Collections"];

  const ProfileScreen = () => {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth(); // Get user from AuthContext
    const [activeTab, setActiveTab] = useState(0);
    const [ownedCards, setOwnedCards] = useState([]);
    const [myBinders, setMyBinders] = useState([]);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollRef = useRef(null);

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

    const navigateEdit = async () => {
      router.navigate('/userpage/editProfile')

    }

    // Fetch user posts
    // Fetch user posts
const fetchUserPosts = async (userId) => {
  try {
    setPostsLoading(true);
    console.log('=== FETCHING USER POSTS ===');
    console.log('User ID:', userId);
    
    const response = await postApi.getPostsByUserId(userId, 100, 1);
    console.log('API Response:', JSON.stringify(response, null, 2));
    
    const rawPosts = response.metadata?.posts || [];
    console.log('Extracted posts:', rawPosts);
    console.log('Number of posts:', rawPosts.length);
    
    // Transform posts to include user data
    const transformedPosts = rawPosts.map(post => ({
      ...post,
      authorName: user?.username || 'Unknown User',
      authorAvatar: user?.avatar_url || null,
      id: post.post_id,
      authorId: post.user_id,
    }));
    
    setUserPosts(transformedPosts);
  } catch (error) {
    console.error('Failed to fetch user posts:', error);
    setUserPosts([]);
  } finally {
    setPostsLoading(false);
  }
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
      // Wait for auth to load and user to be available
      if (authLoading) return;
      
      if (user && user.user_id) {
        fetchCollection();
        fetchUserPosts(user.user_id);
      }
    }, [authLoading, user]);

    const handleCollectionPress = (binder) => {
      router.push({ 
        pathname: '/collections/collectionDetail', 
        params: { 
          collectionId: binder.collection_id 
        } 
      });
    };

    const handleDeleteBinder = async (collectionId) => {
      try {
        await collectionApi.deleteCollection(collectionId);
        // Refresh collections after delete
        fetchCollection();
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        {authLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : !user ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Please log in to view your profile</Text>
          </View>
        ) : (
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
              onPress={navigateEdit}
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
              <Text style={styles.username}>{user?.username}</Text>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>Lv. {user?.level || 36}</Text>
              </View>
            </View>

            <Text style={styles.userTag}>@{user?.userTag}</Text>
            <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
            {user?.website && (
              <Text style={styles.link}>{user.website}</Text>
            )}

            <View style={styles.followRow}>
              <Text style={styles.followText}>
                <Text style={styles.bold}>{user?.followers_count || 0}</Text> Followers
              </Text>
              <Text style={styles.followText}>
                <Text style={styles.bold}>{user?.following_count || 0}</Text> Following
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
                  width: width / 3,
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
            {/* Posts Tab */}
            <View style={{ width }}>
              {postsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              ) : userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <Posts key={post.post_id} post={post} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No posts yet</Text>
                </View>
              )}
            </View>

            {/* Portfolio Tab */}
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
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              ) : ownedCards.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {ownedCards.map((item) => (
                    <View key={item.owned_card_id || item.card_id}>
                      <BinderCard
                        image={item.card?.image || item.image}
                        name={item.card?.name || item.name}
                        setName={item.card?.set_name || item.setName}
                        qty={item.quantity || 1}
                        price={item.card?.price || item.price}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No cards in portfolio</Text>
                </View>
              )}
            </View>

            {/* Collections Tab */}
            <View style={[styles.tabPage, { width }]}>
              <Text style={styles.tabHeader}>Collections</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                </View>
              ) : myBinders.length > 0 ? (
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
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No collections yet</Text>
                </View>
              )}          
            </View>
          </Animated.ScrollView>
        </ScrollView>
        )}
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
      marginBottom: 20,
    },
    smallDeckContainer: {
      height: 200,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: '#888',
      textAlign: 'center',
    },
  });