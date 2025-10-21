import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Posts from '@/components/ui/post';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Post } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Sample data for demonstration
const samplePosts: Post[] = [
  {
    id: '1',
    authorId: 'user1',
    authorName: 'John Doe',
    content: 'Just finished a great workout at the gym! 💪 Feeling energized and ready to take on the day. Who else is staying active today?',
    createdAt: '2 hours ago',
    updatedAt: '2 hours ago',
    likesCount: 24,
    commentsCount: 8,
  },
  {
    id: '2',
    authorId: 'user2',
    authorName: 'Sarah Wilson',
    content: 'Beautiful sunset from my balcony tonight 🌅 Sometimes you just need to pause and appreciate the little moments in life.',
    createdAt: '4 hours ago',
    updatedAt: '4 hours ago',
    likesCount: 42,
    commentsCount: 12,
  },
  {
    id: '3',
    authorId: 'user3',
    authorName: 'Mike Chen',
    content: 'Just launched my new project! After months of hard work, it\'s finally live. Check it out and let me know what you think! 🚀',
    createdAt: '6 hours ago',
    updatedAt: '6 hours ago',
    likesCount: 67,
    commentsCount: 23,
  },
  {
    id: '4',
    authorId: 'user4',
    authorName: 'Emma Thompson',
    content: 'Coffee and good books make the perfect Sunday morning ☕️📚 What\'s everyone else up to this weekend?',
    createdAt: '1 day ago',
    updatedAt: '1 day ago',
    likesCount: 35,
    commentsCount: 15,
  },
  {
    id: '5',
    authorId: 'user5',
    authorName: 'David Rodriguez',
    content: 'Team meeting went great today! Love working with such talented people. Excited for the upcoming project milestones 🎯',
    createdAt: '1 day ago',
    updatedAt: '1 day ago',
    likesCount: 28,
    commentsCount: 7,
  },
];

export default function FeedsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<Post[]>(samplePosts);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleChatPress = () => {
    router.push('/(tabs)/feeds/chat');
  };

  const renderPost = ({ item }: { item: Post }) => (
    <Posts post={item} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
        Feeds
      </ThemedText>
      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: colors.tint }]}
        onPress={handleChatPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        {renderHeader()}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  chatButton: {
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
});