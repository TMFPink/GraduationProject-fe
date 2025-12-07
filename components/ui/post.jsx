import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';

const Posts = ({ post, onUpvote, onDownvote, onDelete, currentUserId }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Get vote state from post data
  const isUpvoted = post.isUpvoted || false;
  const isDownvoted = post.isDownvoted || false;

  // Handle upvote
  const handleUpvote = (e) => {
    e.stopPropagation();
    if (onUpvote) onUpvote();
  };

  // Handle downvote
  const handleDownvote = (e) => {
    e.stopPropagation();
    if (onDownvote) onDownvote();
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  // Navigate to post detail
  const handlePostPress = () => {
    router.push(`/postDetail?postId=${post.id}`);
  };

  // Navigate to user profile
  const handleUserPress = (e) => {
    e.stopPropagation();
    
    if (post.authorId === currentUserId) {
      router.navigate('/(tabs)/userpage');
    } else {
      router.push(`/guestProfile?userId=${post.authorId}`);
    }
  };

  // Calculate net vote display
  const displayVotes = (post.upvotes || 0) - (post.downvotes || 0);

  // Check if thumbnail exists
  const hasValidThumbnail = post.thumbnail && 
                            post.thumbnail !== 'string' && 
                            post.thumbnail.startsWith('http');

  // HTML styles
  const tagsStyles = {
    body: { color: colors.text, fontSize: 15, lineHeight: 22 },
    p: { marginTop: 0, marginBottom: 8 },
    a: { color: colors.tint },
    h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: colors.text },
    h2: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, color: colors.text },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    ul: { marginLeft: 12 },
    ol: { marginLeft: 12 },
  };

  return (
    <TouchableOpacity 
      style={[styles.postCard, { backgroundColor: colors.background }]}
      onPress={handlePostPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity 
          style={styles.postUserInfo}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: colors.tint + '40' }]}>
            {post.authorAvatar ? (
              <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account" size={24} color={colors.tint} />
            )}
          </View>
          
          <View style={styles.postMeta}>
            <Text style={[styles.postUsername, { color: colors.text }]}>
              {post.authorName || 'Unknown User'}
            </Text>
            <Text style={[styles.postDate, { color: colors.muted }]}>
              {post.createdAt}
            </Text>
          </View>
        </TouchableOpacity>

        {currentUserId === post.authorId && (
          <TouchableOpacity onPress={handleDelete}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      {post.title && (
        <Text style={[styles.postTitle, { color: colors.text }]}>
          {post.title}
        </Text>
      )}

      {/* Thumbnail */}
      {hasValidThumbnail && (
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: post.thumbnail }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.contentContainer}>
        <RenderHtml
          source={{ html: post.content || '<p>No content</p>' }}
          tagsStyles={tagsStyles}
          enableExperimentalMarginCollapsing={true}
        />
      </View>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {post.tags.map((tag, index) => (
            <View 
              key={index} 
              style={[styles.tag, { backgroundColor: colors.tint + '15' }]}
            >
              <Text style={[styles.tagText, { color: colors.tint }]}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions Bar */}
      <View style={[styles.actionsBar, { borderTopColor: colors.border }]}>
        <View style={styles.voteSection}>
          {/* Upvote - highlighted if user voted */}
          <TouchableOpacity 
            style={[
              styles.voteButton,
              isUpvoted && { backgroundColor: colors.tint + '20' }
            ]}
            onPress={handleUpvote}
          >
            <MaterialCommunityIcons 
              name={isUpvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
              size={22} 
              color={isUpvoted ? colors.tint : colors.muted} 
            />
          </TouchableOpacity>

          {/* Vote Count */}
          <Text style={[
            styles.voteCount, 
            { 
              color: isUpvoted 
                ? colors.tint 
                : isDownvoted 
                ? '#ff4444' 
                : colors.text 
            }
          ]}>
            {displayVotes}
          </Text>

          {/* Downvote - highlighted if user voted */}
          <TouchableOpacity 
            style={[
              styles.voteButton,
              isDownvoted && { backgroundColor: '#ff444420' }
            ]}
            onPress={handleDownvote}
          >
            <MaterialCommunityIcons 
              name={isDownvoted ? 'arrow-down-bold' : 'arrow-down-bold-outline'}
              size={22} 
              color={isDownvoted ? '#ff4444' : colors.muted} 
            />
          </TouchableOpacity>
        </View>

        {/* Comment */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handlePostPress();
          }}
        >
          <MaterialCommunityIcons name="comment-outline" size={20} color={colors.muted} />
          <Text style={[styles.actionText, { color: colors.muted }]}>
            {post.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => e.stopPropagation()}
        >
          <MaterialCommunityIcons name="share-outline" size={20} color={colors.muted} />
          <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default Posts;

const styles = StyleSheet.create({
  postCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postMeta: {
    flex: 1,
  },
  postUsername: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
  },
  thumbnailContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  contentContainer: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteButton: {
    padding: 6,
    borderRadius: 8,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});