import { Post } from '@/src/types/post';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
const Posts = ({ post }: { post: Post }) => {
  return (
    <View style={styles.newsCard}>
      {/* Header */}
      <View style={styles.newsHeader}>
        <View style={styles.newsUserInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={24} color="#666" />
          </View>
          <View>
            <Text style={styles.newsUsername}>{post.authorName}</Text>
            <Text style={styles.newsDate}>{post.createdAt}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
      </View>

      {/* Thumbnail */}
      <View style={styles.newsThumbnail}>
        <Text style={styles.thumbnailText}>THUMBNAIL</Text>
      </View>

      {/* Content */}
      <Text style={styles.newsContent}>{post.content}</Text>

      {/* Actions */}
      <View style={styles.newsActions}>
        <View style={styles.newsAction}>
          <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#666" />
          <Text style={styles.newsActionText}>{post.likesCount}</Text>
        </View>
        <View style={styles.newsAction}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
          <Text style={styles.newsActionText}>{post.commentsCount}</Text>
        </View>
        <MaterialCommunityIcons name="share-outline" size={20} color="#666" />
      </View>
    </View>
  );
};

export default Posts;

const styles = StyleSheet.create({
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  newsUserInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newsUsername: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  newsDate: { fontSize: 12, color: '#999' },
  newsThumbnail: {
    height: 150,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnailText: { fontSize: 16, fontWeight: 'bold', color: '#999' },
  newsContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  newsAction: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  newsActionText: { fontSize: 14, color: '#666', marginLeft: 6 },
});
