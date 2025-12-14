import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RenderHtml from 'react-native-render-html';

const Posts = ({ post, onUpvote, onDownvote, onDelete, currentUserId }) => {
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
    body: { color: '#ffffff', fontSize: 15, lineHeight: 22 },
    p: { marginTop: 0, marginBottom: 8 },
    a: { color: '#F2CC0F' },
    h1: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#ffffff' },
    h2: { fontSize: 20, fontWeight: 'bold', marginBottom: 6, color: '#ffffff' },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    ul: { marginLeft: 12 },
    ol: { marginLeft: 12 },
  };

  return (
    <TouchableOpacity 
      style={styles.postCard}
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
          <View style={styles.avatar}>
            {post.authorAvatar ? (
              <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="account" size={24} color="#F2CC0F" />
            )}
          </View>
          
          <View style={styles.postMeta}>
            <Text style={styles.postUsername}>
              {post.authorName || 'Unknown User'}
            </Text>
            <Text style={styles.postDate}>
              {post.createdAt}
            </Text>
          </View>
        </TouchableOpacity>

        {currentUserId === post.authorId && (
          <TouchableOpacity onPress={handleDelete}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color="#F2CC0F" />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      {post.title && (
        <Text style={styles.postTitle}>
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
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>
                #{tag}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <View style={styles.voteSection}>
          {/* Upvote */}
          <TouchableOpacity 
            style={[
              styles.voteButton,
              isUpvoted && styles.upvotedButton
            ]}
            onPress={handleUpvote}
          >
            <MaterialCommunityIcons 
              name={isUpvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
              size={22} 
              color={isUpvoted ? '#F2CC0F' : '#f2cc0f5e'} 
            />
          </TouchableOpacity>

          {/* Vote Count */}
          <Text style={[
            styles.voteCount,
            isUpvoted && styles.upvotedText,
            isDownvoted && styles.downvotedText
          ]}>
            {displayVotes}
          </Text>

          {/* Downvote */}
          <TouchableOpacity 
            style={[
              styles.voteButton,
              isDownvoted && styles.downvotedButton
            ]}
            onPress={handleDownvote}
          >
            <MaterialCommunityIcons 
              name={isDownvoted ? 'arrow-down-bold' : 'arrow-down-bold-outline'}
              size={22} 
              color={isDownvoted ? '#F2CC0F' : '#f2cc0f5e'} 
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
          <MaterialCommunityIcons name="comment-outline" size={20} color="#f2cc0f5e" />
          <Text style={styles.actionText}>
            {post.commentsCount || 0}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={(e) => e.stopPropagation()}
        >
          <MaterialCommunityIcons name="share-outline" size={20} color="#f2cc0f5e" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default Posts;

const styles = StyleSheet.create({
  postCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#212121',
    borderWidth: 2,
    borderColor: '#f2cc0f5e',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 2,
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
    backgroundColor: '#F2CC0F',
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
    color: '#F2CC0F',
  },
  postDate: {
    fontSize: 12,
    color: '#f2cc0f5e',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
    color: '#ffffff',
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
    backgroundColor: '#f2cc0f5e',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F2CC0F',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,

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
  upvotedButton: {
    backgroundColor: '#f2cc0f5e',
  },
  downvotedButton: {
    backgroundColor: '#f2cc0f5e',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 30,
    textAlign: 'center',
    color: '#F2CC0F',
  },
  upvotedText: {
    color: '#F2CC0F',
  },
  downvotedText: {
    color: '#F2CC0F',
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
    color: '#F2CC0F',
  },
});