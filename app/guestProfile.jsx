import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

// Components
import Posts from "@/components/ui/post";
import BinderCard from "@/components/ui/item-binder";
import ItemDeck from "@/components/ui/item-deck";
import FollowModal from "@/components/ui/modals/followModal";

// Context & API
import { useAuth } from "@/src/contexts/auth-context";
import { authApi } from "@/src/api/auth-api";
import { postApi } from "@/src/api/post-api";
import { collectionApi } from "@/src/api/collection-api";
import { followApi } from "@/src/api/follow-api";

const TABS = ["Posts", "Portfolio", "Collections"];

const GuestProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const width = Dimensions.get("window").width;

  const [activeTab, setActiveTab] = useState(0);

  // Data States
  const [guestUser, setGuestUser] = useState(null);
  const [guestPosts, setGuestPosts] = useState([]);
  const [featuredCards, setFeaturedCards] = useState([]);
  const [ownedCards, setOwnedCards] = useState([]);
  const [guestBinders, setGuestBinders] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("followers");

  // Animation Refs
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

  const handleFollowersPress = () => {
    setModalMode("followers");
    setModalVisible(true);
  };

  const handleFollowingPress = () => {
    setModalMode("following");
    setModalVisible(true);
  };

  // Fetch guest user data
  const fetchGuestUser = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserById(userId);
      const userData = response.metadata;
      setGuestUser(userData);

      // Extract featured cards from user data
      const featured = userData.featureCards || [];
      setFeaturedCards(featured);
    } catch (error) {
      console.error("Failed to fetch guest user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch guest user posts
  // ✅ UPDATE fetchGuestPosts function
const fetchGuestPosts = async () => {
  try {
    setPostsLoading(true);
    const response = await postApi.getPostsByUserId(userId, 100, 1);
    const rawPosts = response.metadata?.posts || [];

    const transformedPosts = rawPosts.map((post) => ({
      ...post,
      authorName: guestUser?.username || "Unknown User",
      authorAvatar: guestUser?.avatar_url || null,
      id: post.post_id,
      authorId: post.user_id,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      isUpvoted: post.isUpvoted || false,      // ✅ ADD THIS
      isDownvoted: post.isDownvoted || false,  // ✅ ADD THIS
    }));

    setGuestPosts(transformedPosts);
  } catch (error) {
    console.error("Failed to fetch guest posts:", error);
    setGuestPosts([]);
  } finally {
    setPostsLoading(false);
  }
};

// ✅ ADD VOTE HANDLERS (add these functions after fetchGuestCollections)
const handleUpvote = async (postId) => {
  const currentPost = guestPosts.find(p => p.id === postId);
  if (!currentPost) return;

  const wasUpvoted = currentPost.isUpvoted;
  const wasDownvoted = currentPost.isDownvoted;
  const newIsUpvoted = !wasUpvoted;
  const newIsDownvoted = false;

  try {
    // Optimistic update
    setGuestPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post,
              isUpvoted: newIsUpvoted,
              isDownvoted: newIsDownvoted,
            }
          : post
      )
    );

    const response = await postApi.upvotePost(postId);
    
    if (response && response.metadata) {
      setGuestPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                upvotes: response.metadata.upvotes,
                downvotes: response.metadata.downvotes,
                isUpvoted: newIsUpvoted,
                isDownvoted: newIsDownvoted,
              }
            : post
        )
      );
    }
  } catch (err) {
    console.error('Error upvoting post:', err);
    // Revert on error
    setGuestPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post,
              isUpvoted: wasUpvoted,
              isDownvoted: wasDownvoted,
            }
          : post
      )
    );
  }
};

const handleDownvote = async (postId) => {
  const currentPost = guestPosts.find(p => p.id === postId);
  if (!currentPost) return;

  const wasUpvoted = currentPost.isUpvoted;
  const wasDownvoted = currentPost.isDownvoted;
  const newIsUpvoted = false;
  const newIsDownvoted = !wasDownvoted;

  try {
    // Optimistic update
    setGuestPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post,
              isUpvoted: newIsUpvoted,
              isDownvoted: newIsDownvoted,
            }
          : post
      )
    );

    const response = await postApi.downvotePost(postId);
    
    if (response && response.metadata) {
      setGuestPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { 
                ...post, 
                upvotes: response.metadata.upvotes,
                downvotes: response.metadata.downvotes,
                isUpvoted: newIsUpvoted,
                isDownvoted: newIsDownvoted,
              }
            : post
        )
      );
    }
  } catch (err) {
    console.error('Error downvoting post:', err);
    // Revert on error
    setGuestPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { 
              ...post,
              isUpvoted: wasUpvoted,
              isDownvoted: wasDownvoted,
            }
          : post
      )
    );
  }
};

const handleDeletePost = async (postId) => {
  try {
    const response = await postApi.deletePost(postId);
    if (response.success) {
      setGuestPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    }
  } catch (err) {
    console.error('Error deleting post:', err);
  }
};

  // Fetch guest collections
  const fetchGuestCollections = async () => {
    try {
      setCollectionsLoading(true);

      // Fetch owned cards for this user
      const ownedResponse = await ownedCardApi.getOwnedCardByUserId(userId, 1, 100);
      const ownedCardsData = ownedResponse.metadata?.ownedCards || [];
      setOwnedCards(ownedCardsData);

      // Fetch collections/binders
      const collectionsResponse = await collectionApi.getAllCollection(1, 100);
      const collections = collectionsResponse.metadata?.collections || [];
      // Filter binders that belong to this user
      const userBinders = collections.filter(
        (col) => col.user_id === userId && col.name !== "Owned Cards"
      );
      setGuestBinders(userBinders);
    } catch (error) {
      console.error("Failed to fetch guest collections:", error);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Check if current user is following this guest
  const checkFollowStatus = async () => {
    if (!currentUser) return;
    
    try {
      const response = await followApi.getMyFollowing(100, 1);
      const following = response.metadata?.following || [];
      const isUserFollowing = following.some(
        (f) => f.following_id === userId || f.user_id === userId
      );
      setIsFollowing(isUserFollowing);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  // Handle follow toggle
  const handleFollowToggle = async () => {
    if (!currentUser || followLoading) return;

    try {
      setFollowLoading(true);
      await followApi.followToggle({ following_id: userId });
      setIsFollowing(!isFollowing);
      
      // Update follower count
      setGuestUser((prev) => ({
        ...prev,
        followers_count: isFollowing
          ? (prev.followers_count || 0) - 1
          : (prev.followers_count || 0) + 1,
      }));
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCollectionPress = (binder) => {
    router.push({
      pathname: "/collections/collectionDetail",
      params: {
        collectionId: binder.collection_id,
      },
    });
  };

  useEffect(() => {
    if (userId) {
      fetchGuestUser();
      checkFollowStatus();
    }
  }, [userId, currentUser]);

  useEffect(() => {
    if (guestUser) {
      fetchGuestPosts();
      fetchGuestCollections();
    }
  }, [guestUser]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  if (!guestUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>User not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button Overlay */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButtonOverlay}
      >
        <Text style={styles.backButtonOverlayText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri:
                guestUser.cover_url ||
                "https://images.unsplash.com/photo-1503264116251-35a269479413",
            }}
            style={styles.coverImage}
          />
        </View>

        {/* Profile Row */}
        <View style={styles.profileRow}>
          <Image
            source={{
              uri:
                guestUser.avatar_url ||
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e",
            }}
            style={styles.avatar}
          />
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <View style={styles.nameAndLevel}>
              <Text style={styles.username}>{guestUser.username}</Text>
              <View style={styles.levelTag}>
                <Text style={styles.levelText}>
                  Lv. {guestUser.level || 1}
                </Text>
              </View>
            </View>
            {currentUser && currentUser.user_id !== userId && (
              <TouchableOpacity
                onPress={handleFollowToggle}
                disabled={followLoading}
                style={[
                  styles.followButton,
                  isFollowing && styles.followingButton,
                ]}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    isFollowing && styles.followingButtonText,
                  ]}
                >
                  {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.userTag}>
            @{guestUser.userTag || guestUser.username}
          </Text>
          <Text style={styles.bio}>{guestUser.bio || "No bio yet"}</Text>
          {guestUser.website && (
            <Text style={styles.link}>{guestUser.website}</Text>
          )}

          <View style={styles.followRow}>
            <TouchableOpacity onPress={handleFollowersPress}>
              <Text style={styles.followText}>
                <Text style={styles.bold}>
                  {guestUser.followers_count || 0}
                </Text>{" "}
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFollowingPress}>
              <Text style={styles.followText}>
                <Text style={styles.bold}>
                  {guestUser.following_count || 0}
                </Text>{" "}
                Following
              </Text>
            </TouchableOpacity>
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
            ) : guestPosts.length > 0 ? (
              guestPosts.map((post) => 
              <Posts 
                key={post.post_id} 
                post={post} 
                onUpvote={() => handleUpvote(post.id)}      // ✅ ADD THIS
                onDownvote={() => handleDownvote(post.id)}  // ✅ ADD THIS
                onDelete={() => handleDeletePost(post.id)}  // ✅ ADD THIS
                currentUserId={currentUser?.user_id}  />)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            )}
          </View>

          {/* Portfolio Tab */}
          <View style={[styles.tabPage, { width }]}>
            {/* Featured cards */}
            <Text style={styles.tabHeader}>Featured Cards</Text>

            <View style={[styles.deckContainer, styles.smallDeckContainer]}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((index) => {
                  const item = featuredCards[index];

                  if (item) {
                    const imageUrl =
                      item.card?.image_normal_url ||
                      item.card?.image_small_url ||
                      item.image_normal_url;
                    return (
                      <Image
                        key={item.feature_card_id || index}
                        source={{ uri: imageUrl }}
                        style={styles.featuredCardSlot}
                      />
                    );
                  } else {
                    return (
                      <View
                        key={`placeholder-${index}`}
                        style={[
                          styles.featuredCardSlot,
                          styles.placeholderCard,
                        ]}
                      />
                    );
                  }
                })}
              </View>
            </View>

            {/* Main Portfolio */}
            <Text style={styles.tabHeader}>Main Portfolio</Text>
            {collectionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : ownedCards.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {ownedCards.map((item, index) => {
                  const cardData = item.card || item.Card || {};
                  const image =
                    cardData.image_normal_url ||
                    cardData.image_small_url ||
                    item.image;
                  const name = cardData.name || item.name || "Unknown Card";
                  const setName = cardData.set_name || item.setName;
                  const price = cardData.price || item.price;
                  const qty = item.quantity || 1;

                  return (
                    <View key={item.owned_card_id || item.card_id || index}>
                      <BinderCard
                        image={image}
                        name={name}
                        setName={setName}
                        qty={qty}
                        price={price}
                      />
                    </View>
                  );
                })}
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
            {collectionsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : guestBinders.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {guestBinders.map((binder) => (
                  <ItemDeck
                    key={binder.collection_id}
                    name={binder.name}
                    collectionId={binder.collection_id}
                    onPress={() => handleCollectionPress(binder)}
                    showDelete={false}
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

      {/* Follow Modal */}
      {guestUser && (
        <FollowModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          userId={userId}
          mode={modalMode}
        />
      )}
    </SafeAreaView>
  );
};

export default GuestProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  coverContainer: { width: "100%", height: 200 },
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
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  nameAndLevel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#000",
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  followingButtonText: {
    color: "#333",
  },
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
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
    marginTop: 50,
    
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
  deckContainer: {
    minHeight: 150,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 8,
    marginBottom: 20,
  },
  smallDeckContainer: {},
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  featuredCardSlot: {
    width: 100,
    height: 140,
    borderRadius: 8,
    resizeMode: "contain",
  },
  placeholderCard: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "solid",
  },
  backButtonOverlay: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 999,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonOverlayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});