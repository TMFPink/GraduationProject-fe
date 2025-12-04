import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import Posts from "@/components/ui/post";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "@/src/api/auth-api";
import { postApi } from "@/src/api/post-api";
import { useLocalSearchParams, useRouter } from "expo-router";

const GuestProfileScreen = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [guestUser, setGuestUser] = useState(null);
  const [guestPosts, setGuestPosts] = useState([]);
  const [featuredCards, setFeaturedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch guest user data
  const fetchGuestUser = async () => {
    try {
      setLoading(true);
      const response = await authApi.getUserById(userId);
      const userData = response.metadata;
      setGuestUser(userData);
    } catch (error) {
      console.error("Failed to fetch guest user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch guest user posts
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
      }));

      setGuestPosts(transformedPosts);
    } catch (error) {
      console.error("Failed to fetch guest posts:", error);
      setGuestPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGuestUser();
    }
  }, [userId]);

  useEffect(() => {
    if (guestUser) {
      fetchGuestPosts();
      // Option C: Hardcode empty featured cards for now
      setFeaturedCards([]);
    }
  }, [guestUser]);

  const handleFollowToggle = () => {
    // Decoy button - no API call yet
    setIsFollowing(!isFollowing);
  };

  const handleBack = () => {
    router.back();
  };

  // Placeholder card component
  const PlaceholderCard = () => (
    <View style={styles.placeholderCard}>
      <View style={styles.placeholderCardInner}>
        <Text style={styles.placeholderText}>?</Text>
      </View>
    </View>
  );

  // Render featured cards (3 cards horizontal)
  const renderFeaturedCards = () => {
    const cards = [...featuredCards];
    while (cards.length < 3) {
      cards.push(null); // Fill with nulls for placeholders
    }

    return (
      <View style={styles.featuredCardsRow}>
        {cards.slice(0, 3).map((card, index) =>
          card ? (
            <TouchableOpacity key={index} style={styles.featuredCardItem}>
              <Image
                source={{ uri: card.card?.image_normal_url }}
                style={styles.featuredCardImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : (
            <PlaceholderCard key={`placeholder-${index}`} />
          )
        )}
      </View>
    );
  };

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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.levelText}>Lv. {guestUser.level || 36}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleFollowToggle}
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
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userTag}>@{guestUser.userTag}</Text>
          <Text style={styles.bio}>{guestUser.bio || "No bio yet"}</Text>
          {guestUser.website && (
            <Text style={styles.link}>{guestUser.website}</Text>
          )}

          <View style={styles.followRow}>
            <Text style={styles.followText}>
              <Text style={styles.bold}>{guestUser.followers_count || 0}</Text>{" "}
              Followers
            </Text>
            <Text style={styles.followText}>
              <Text style={styles.bold}>{guestUser.following_count || 0}</Text>{" "}
              Following
            </Text>
          </View>
        </View>

        {/* Featured Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Cards</Text>
          {renderFeaturedCards()}
        </View>

        {/* Posts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Posts</Text>
          {postsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : guestPosts.length > 0 ? (
            guestPosts.map((post) => <Posts key={post.post_id} post={post} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuestProfileScreen;

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
    marginBottom: 24,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#222",
  },
  featuredCardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  featuredCardItem: {
    width: 100,
    aspectRatio: 0.686,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  featuredCardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderCard: {
    width: 100,
    aspectRatio: 0.686,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  placeholderCardInner: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d0d0d0",
  },
  placeholderText: {
    fontSize: 32,
    color: "#999",
    fontWeight: "300",
  },
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
});