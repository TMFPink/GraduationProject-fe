import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/src/api/auth-api';
import { commentApi } from '@/src/api/comment-api';
import { followApi } from '@/src/api/follow-api';
import { postApi } from '@/src/api/post-api';
import { useAuth } from '@/src/contexts/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // State
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(true);

  // Fetch post detail
  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPostById(postId);
      
      if (response && response.metadata) {
        const postData = response.metadata;
        
        // Fetch author data
        const authorData = await authApi.getUserById(postData.user_id);
        
        setPost({
          id: postData.post_id,
          authorId: postData.user_id,
          authorName: authorData.metadata.username,
          authorAvatar: authorData.metadata.avatar_url,
          title: postData.title,
          content: postData.content,
          thumbnail: postData.thumbnail,
          mediaUrl: postData.media_url,
          tags: postData.tags,
          createdAt: formatDate(postData.createdAt),
          updatedAt: formatDate(postData.updatedAt),
          upvotes: postData.upvotes,
          downvotes: postData.downvotes,
          netVotes: postData.upvotes - postData.downvotes,
          isUpvoted: postData.isUpvoted || false,       
          isDownvoted: postData.isDownvoted || false, 
        });
      }
    } catch (error) {
      console.error('Error fetching post detail:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await commentApi.getCommentByPostId(postId, 100, 1);
      
      if (response && response.metadata) {
        const commentsData = response.metadata.map(comment => ({
          id: comment.comment_id,
          postId: comment.post_id,
          userId: comment.user_id,
          content: comment.content,
          parentId: comment.parent_id,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          netVotes: comment.upvotes - comment.downvotes,
          createdAt: formatDate(comment.createdAt),
          user: {
            userId: comment.user?.user_id,
            username: comment.user?.username || 'Unknown',
            avatar: comment.user?.avatar_url,
          },
          replies: comment.replies || [],
        }));
        
        setComments(commentsData);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Check if following author
  const checkFollowStatus = async () => {
    if (!post || !currentUser || post.authorId === currentUser.user_id) {
      setCheckingFollow(false);
      return;
    }

    try {
      const response = await followApi.getMyFollowing(1000, 1);
      if (response && response.metadata && response.metadata.following) {
        const isFollowingAuthor = response.metadata.following.some(
          (user) => user.user_id === post.authorId
        );
        setIsFollowing(isFollowingAuthor);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setCheckingFollow(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
      fetchComments();
    }
  }, [postId]);

  useEffect(() => {
    if (post) {
      checkFollowStatus();
    }
  }, [post]);

  // Vote handlers
  const handlePostUpvote = async () => {
    const wasUpvoted = post.isUpvoted;
    const wasDownvoted = post.isDownvoted;
    
    // Toggle logic
    const newIsUpvoted = !wasUpvoted;
    const newIsDownvoted = false;

    try {
      // Optimistic update
      setPost(prev => ({
        ...prev,
        isUpvoted: newIsUpvoted,
        isDownvoted: newIsDownvoted,
      }));

      const response = await postApi.upvotePost(postId);
      if (response && response.metadata) {
        setPost(prev => ({
          ...prev,
          upvotes: response.metadata.upvotes,
          downvotes: response.metadata.downvotes,
          netVotes: response.metadata.upvotes - response.metadata.downvotes,
          isUpvoted: newIsUpvoted,
          isDownvoted: newIsDownvoted,
        }));
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
      // Revert on error
      setPost(prev => ({
        ...prev,
        isUpvoted: wasUpvoted,
        isDownvoted: wasDownvoted,
      }));
    }
  };

  const handlePostDownvote = async () => {
    const wasUpvoted = post.isUpvoted;
    const wasDownvoted = post.isDownvoted;
    
    // Toggle logic
    const newIsUpvoted = false;
    const newIsDownvoted = !wasDownvoted;

    try {
      // Optimistic update
      setPost(prev => ({
        ...prev,
        isUpvoted: newIsUpvoted,
        isDownvoted: newIsDownvoted,
      }));

      const response = await postApi.downvotePost(postId);
      if (response && response.metadata) {
        setPost(prev => ({
          ...prev,
          upvotes: response.metadata.upvotes,
          downvotes: response.metadata.downvotes,
          netVotes: response.metadata.upvotes - response.metadata.downvotes,
          isUpvoted: newIsUpvoted,
          isDownvoted: newIsDownvoted,
        }));
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
      // Revert on error
      setPost(prev => ({
        ...prev,
        isUpvoted: wasUpvoted,
        isDownvoted: wasDownvoted,
      }));
    }
  };

  // Handle comment upvote
  const handleCommentUpvote = async (commentId) => {
    try {
      const response = await commentApi.upvoteComment(commentId);
      if (response && response.metadata) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  upvotes: response.metadata.upvotes,
                  downvotes: response.metadata.downvotes,
                  netVotes: response.metadata.upvotes - response.metadata.downvotes,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error upvoting comment:', error);
    }
  };

  // Handle comment downvote
  const handleCommentDownvote = async (commentId) => {
    try {
      const response = await commentApi.downvoteComment(commentId);
      if (response && response.metadata) {
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  upvotes: response.metadata.upvotes,
                  downvotes: response.metadata.downvotes,
                  netVotes: response.metadata.upvotes - response.metadata.downvotes,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error downvoting comment:', error);
    }
  };

  // Submit comment
  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await commentApi.createComment({
        post_id: postId,
        content: commentText.trim(),
        parent_id: null,
      });

      if (response && response.metadata) {
        const newComment = {
          id: response.metadata.comment_id,
          postId: response.metadata.post_id,
          userId: response.metadata.user_id,
          content: response.metadata.content,
          parentId: response.metadata.parent_id,
          upvotes: response.metadata.upvotes || 0,
          downvotes: response.metadata.downvotes || 0,
          netVotes: (response.metadata.upvotes || 0) - (response.metadata.downvotes || 0),
          createdAt: formatDate(response.metadata.createdAt || new Date().toISOString()),
          user: {
            userId: currentUser?.user_id,
            username: currentUser?.username || 'Me',
            avatar: currentUser?.avatar_url,
          },
          replies: [],
        };

        setComments(prev => [newComment, ...prev]);
        setCommentText('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle follow toggle
  const handleFollowToggle = async () => {
    try {
      const response = await followApi.followToggle({
        following_id: post.authorId,
      });

      if (response && response.metadata) {
        setIsFollowing(response.metadata.isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  // Navigate to author profile
  const navigateToProfile = () => {
    router.push(`/(tabs)/profile/guest?userId=${post.authorId}`);
  };

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

  // Render comment item
  const renderComment = ({ item }) => (
    <View style={[styles.commentCard, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.commentHeader}>
        <TouchableOpacity 
          style={styles.commentUserInfo}
          onPress={() => router.push(`/(tabs)/profile/guest?userId=${item.userId}`)}
        >
          <View style={[styles.commentAvatar, { backgroundColor: colors.tint + '40' }]}>
            {item.user.avatar ? (
              <Image source={{ uri: item.user.avatar }} style={styles.commentAvatarImage} />
            ) : (
              <MaterialCommunityIcons name="account" size={20} color={colors.tint} />
            )}
          </View>
          <View>
            <Text style={[styles.commentUsername, { color: colors.text }]}>
              {item.user.username}
            </Text>
            <Text style={[styles.commentDate, { color: colors.muted }]}>
              {item.createdAt}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.commentContent, { color: colors.text }]}>
        {item.content}
      </Text>

      <View style={styles.commentActions}>
        <TouchableOpacity 
          style={styles.commentVoteButton}
          onPress={() => handleCommentUpvote(item.id)}
        >
          <MaterialCommunityIcons name="arrow-up-bold-outline" size={18} color={colors.muted} />
        </TouchableOpacity>
        
        <Text style={[styles.commentVoteCount, { color: colors.text }]}>
          {item.netVotes}
        </Text>
        
        <TouchableOpacity 
          style={styles.commentVoteButton}
          onPress={() => handleCommentDownvote(item.id)}
        >
          <MaterialCommunityIcons name="arrow-down-bold-outline" size={18} color={colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <ThemedText style={{ marginTop: 12, color: colors.muted }}>
            Loading post...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Added Back Button for Error State too */}
        <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButtonOverlay}
        >
            <Text style={styles.backButtonOverlayText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <ThemedText>Post not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const hasValidThumbnail = post.thumbnail && 
                            post.thumbnail !== 'string' && 
                            post.thumbnail.startsWith('http');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ✅ NEW BACK BUTTON OVERLAY */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        style={styles.backButtonOverlay}
      >
        <Text style={styles.backButtonOverlayText}>← Back</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Post Content */}
          <View style={styles.postContainer}>
            {/* Header with Author Info */}
            <View style={styles.postHeader}>
              <TouchableOpacity 
                style={styles.authorInfo}
                onPress={navigateToProfile}
              >
                <View style={[styles.avatar, { backgroundColor: colors.tint + '40' }]}>
                  {post.authorAvatar ? (
                    <Image source={{ uri: post.authorAvatar }} style={styles.avatarImage} />
                  ) : (
                    <MaterialCommunityIcons name="account" size={28} color={colors.tint} />
                  )}
                </View>
                <View style={styles.authorMeta}>
                  <Text style={[styles.authorName, { color: colors.text }]}>
                    {post.authorName}
                  </Text>
                  <Text style={[styles.postDate, { color: colors.muted }]}>
                    {post.createdAt}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Follow Button */}
              {currentUser && currentUser.user_id !== post.authorId && (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    { 
                      backgroundColor: isFollowing ? 'transparent' : colors.tint,
                      borderWidth: isFollowing ? 1 : 0,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={handleFollowToggle}
                  disabled={checkingFollow}
                >
                  {checkingFollow ? (
                    <ActivityIndicator size="small" color={colors.tint} />
                  ) : (
                    <Text style={[
                      styles.followButtonText,
                      { color: isFollowing ? colors.text : 'white' }
                    ]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  )}
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
              <Image 
                source={{ uri: post.thumbnail }} 
                style={styles.postImage}
                resizeMode="cover"
              />
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

            {/* Vote Bar */}
            <View style={[styles.voteBar, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <View style={styles.voteSection}>
                <TouchableOpacity 
                  style={[
                    styles.voteButton,
                    post.isUpvoted && { backgroundColor: colors.tint + '20' }
                  ]}
                  onPress={handlePostUpvote}
                >
                  <MaterialCommunityIcons 
                    name={post.isUpvoted ? 'arrow-up-bold' : 'arrow-up-bold-outline'}
                    size={24} 
                    color={post.isUpvoted ? colors.tint : colors.muted} 
                  />
                </TouchableOpacity>
                
                <Text style={[
                  styles.voteCount, 
                  { 
                    color: post.isUpvoted 
                      ? colors.tint 
                      : post.isDownvoted 
                      ? '#ff4444' 
                      : colors.text 
                  }
                ]}>
                  {post.netVotes}
                </Text>
                
                <TouchableOpacity 
                  style={[
                    styles.voteButton,
                    post.isDownvoted && { backgroundColor: '#ff444420' }
                  ]}
                  onPress={handlePostDownvote}
                >
                  <MaterialCommunityIcons 
                    name={post.isDownvoted ? 'arrow-down-bold' : 'arrow-down-bold-outline'}
                    size={24} 
                    color={post.isDownvoted ? '#ff4444' : colors.muted} 
                  />
                </TouchableOpacity>
              </View>


              <TouchableOpacity style={styles.actionButton}>
                <MaterialCommunityIcons name="share-outline" size={22} color={colors.muted} />
                <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Comment Input */}
            <View style={[styles.commentInputContainer, { borderBottomColor: colors.border }]}>
              <View style={[styles.currentUserAvatar, { backgroundColor: colors.tint + '40' }]}>
                {currentUser?.avatar_url ? (
                  <Image source={{ uri: currentUser.avatar_url }} style={styles.currentUserAvatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={20} color={colors.tint} />
                )}
              </View>
              
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                }]}
                placeholder="Write a comment..."
                placeholderTextColor={colors.muted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  { backgroundColor: commentText.trim() ? colors.tint : colors.border }
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <MaterialCommunityIcons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsSection}>
              <Text style={[styles.commentsSectionTitle, { color: colors.text }]}>
                Comments ({comments.length})
              </Text>

              {commentsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.tint} />
                </View>
              ) : comments.length > 0 ? (
                <FlatList
                  data={comments}
                  renderItem={renderComment}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyComments}>
                  <Text style={[styles.emptyCommentsText, { color: colors.muted }]}>
                    No comments yet. Be the first to comment!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // ✅ NEW BACK BUTTON STYLES
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
  // END NEW STYLES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    flex: 1,
    paddingTop: 50, // Added padding top to prevent content overlap with back button
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  postDate: {
    fontSize: 13,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    marginBottom: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  voteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  currentUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  currentUserAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    borderWidth: 1,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentsSection: {
    padding: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '700',
  },
  commentDate: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
    paddingLeft: 40,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 40,
  },
  commentVoteButton: {
    padding: 4,
  },
  commentVoteCount: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  emptyComments: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 15,
    textAlign: 'center',
  },
});