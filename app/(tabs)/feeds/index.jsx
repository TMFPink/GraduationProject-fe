import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Posts from '@/components/ui/post';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { postApi } from '@/src/api/post-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FeedsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch posts from API
  const fetchPosts = async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      console.log('Fetching posts - Page:', pageNum);
      const response = await postApi.getAllPost(20, pageNum);
      console.log('API Response:', response);
      
      // Extract posts from metadata structure
      if (response && response.metadata && Array.isArray(response.metadata.posts)) {
        const newPosts = response.metadata.posts;
        console.log('Posts received:', newPosts.length);
        
        // Transform post data to match your component's expected format
        const transformedPosts = newPosts.map(post => ({
          id: post.post_id,
          authorId: post.user_id,
          authorName: 'User', // You may need to fetch this separately or include in API
          title: post.title,
          content: post.content,
          thumbnail: post.thumbnail,
          mediaUrl: post.media_url,
          tags: post.tags,
          createdAt: formatDate(post.createdAt),
          updatedAt: formatDate(post.updatedAt),
          likesCount: post.upvotes - post.downvotes,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          commentsCount: 0, // Add if available in your API
        }));
        
        if (isRefresh || pageNum === 1) {
          setPosts(transformedPosts);
        } else {
          setPosts(prevPosts => [...prevPosts, ...transformedPosts]);
        }
        
        // Check if there are more posts to load based on total
        const { total, limit } = response.metadata;
        setHasMore(pageNum * limit < total);
        setPage(pageNum);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      console.error('Error details:', err.response || err);
      setError(err.message || 'Failed to load posts. Please try again.');
      
      // Show error for a few seconds then hide
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchPosts(1, true);
  }, []);

  // Load more posts (pagination)
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchPosts(page + 1);
    }
  }, [loadingMore, hasMore, loading, page]);

  // Handle post actions
  const handleUpvote = async (postId) => {
    try {
      const response = await postApi.upvotePost(postId);
      if (response.success) {
        // Update the post in the list
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likesCount: (post.likesCount || 0) + 1 }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Error upvoting post:', err);
    }
  };

  const handleDownvote = async (postId) => {
    try {
      const response = await postApi.downvotePost(postId);
      if (response.success) {
        // Update the post in the list
        setPosts(prevPosts =>
          prevPosts.map(post =>
            post.id === postId
              ? { ...post, likesCount: Math.max((post.likesCount || 0) - 1, 0) }
              : post
          )
        );
      }
    } catch (err) {
      console.error('Error downvoting post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const response = await postApi.deletePost(postId);
      if (response.success) {
        // Remove the post from the list
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Navigation handlers
  const handleChatPress = () => {
    router.navigate('/(tabs)/feeds/chat');
  };

  const handleCreatePost = () => {
    router.navigate('/(tabs)/feeds/createPost');
  };

  // Render functions
  const renderPost = ({ item }) => (
    <Posts
      post={item}
      onUpvote={() => handleUpvote(item.id)}
      onDownvote={() => handleDownvote(item.id)}
      onDelete={() => handleDeletePost(item.id)}
    />
  );

  const renderHeader = () => (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Feeds
      </ThemedText>
      <View style={styles.headerButtons}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.tint }]}
          onPress={handleCreatePost}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.tint }]}
          onPress={handleChatPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper-outline" size={64} color={colors.muted} />
        <ThemedText style={[styles.emptyText, { color: colors.text }]}>
          No posts yet
        </ThemedText>
        <ThemedText style={[styles.emptySubtext, { color: colors.muted }]}>
          Be the first to create a post!
        </ThemedText>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.tint }]}
          onPress={handleCreatePost}
        >
          <ThemedText style={styles.createButtonText}>Create Post</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.tint} />
        <ThemedText style={[styles.loadingText, { color: colors.muted }]}>
          Loading more posts...
        </ThemedText>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={[styles.errorBanner, { backgroundColor: '#ff4444' }]}>
        <Ionicons name="alert-circle" size={20} color="white" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // Loading state
  if (loading && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.container}>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={[styles.loadingText, { color: colors.muted }]}>
              Loading posts...
            </ThemedText>
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        {renderHeader()}
        {renderError()}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={[
            styles.listContent,
            posts.length === 0 && styles.listContentEmpty
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});