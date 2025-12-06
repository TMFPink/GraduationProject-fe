import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { followApi } from '@/src/api/follow-api';
import { useAuth } from '@/src/contexts/auth-context';
import { useRouter } from 'expo-router';

const FollowModal = ({ visible, onClose, userId, mode }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState({});

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible, mode, userId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;

      if (mode === 'followers') {
        response = await followApi.getFollowersByUserId(userId);
      } else {
        response = await followApi.getFollowingByUserId(userId);
      }

      const usersList = response.metadata?.users || [];
      setUsers(usersList);

      // Initialize following states
      const states = {};
      usersList.forEach((u) => {
        states[u.user_id] = u.isFollowing || false;
      });
      setFollowingStates(states);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId) => {
    try {
      await followApi.followToggle({ following_id: targetUserId });
      
      // Toggle the local state
      setFollowingStates(prev => ({
        ...prev,
        [targetUserId]: !prev[targetUserId],
      }));
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleUserPress = (targetUserId) => {
    onClose();
    if (targetUserId === user?.user_id) {
      router.push('/userpage/profile');
    } else {
      router.push({
        pathname: '/guestProfile',
        params: { userId: targetUserId },
      });
    }
  };

  const renderUser = ({ item }) => {
    const isCurrentUser = item.user_id === user?.user_id;
    const isFollowing = followingStates[item.user_id] || false;

    return (
      <View style={styles.userItem}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => handleUserPress(item.user_id)}
        >
          <Image
            source={{
              uri: item.avatar_url || 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
            }}
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.userTag}>@{item.userTag}</Text>
          </View>
        </TouchableOpacity>

        {!isCurrentUser && (
          <TouchableOpacity
            onPress={() => handleFollowToggle(item.user_id)}
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
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {mode === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.user_id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 2,
  },
  userTag: {
    fontSize: 14,
    color: '#666',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#000',
    marginLeft: 12,
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  followingButtonText: {
    color: '#333',
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

export default FollowModal;