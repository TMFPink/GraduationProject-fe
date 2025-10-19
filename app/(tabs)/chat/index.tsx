import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatApi } from '@/src/api/chat-api';
import { useSocket } from '@/src/contexts/socket-context';
import { ChatSummary } from '@/src/types/chat';
import { getUserData } from '@/src/utils/auth';
import { formatTime } from '@/src/utils/format-time';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { socket } = useSocket();
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chatList, setChatList] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const filteredChats = chatList.filter(chat =>
    chat.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
    chat.last_message.toLowerCase().includes(searchText.toLowerCase())
  );
  

  const handleChatPress = (chat: ChatSummary) => {
    const fullName = chat.last_name ? `${chat.first_name} ${chat.last_name}` : chat.first_name;
    router.push(`/(tabs)/chat/${chat.user_id}?userName=${encodeURIComponent(fullName)}` as any);
  };

  const handleNewChat = () => {
    Alert.alert('New Chat', 'Start a new conversation');
  };

  const loadChatList = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getChatList();
      if (response.statusCode === 200 && response.metadata) {
        setChatList(response.metadata.chat_list);
      } else {
        setChatList([]); 
        console.log('Unexpected response structure:', response);
      }
    } catch (error) {
      console.error('Error loading chat list:', error);
      Alert.alert('Error', 'Failed to load chat list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatList();
    setRefreshing(false);
  };

  // Call loadChatList when the screen is focused/back from other pages
  useFocusEffect(
    useCallback(() => {
      loadChatList();
      // Get current user ID for socket events
      getUserData().then(userData => {
        if (userData?.user_id) {
          setCurrentUserId(userData.user_id);
        }
      });
    }, [])
  );

  // Socket listener for chat list refresh
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleRefreshChatList = () => {
      loadChatList();
    };

    const handleReceiveMessage = async (msg: any) => {
      // Refresh chat list when receiving a message
      loadChatList();
    };

    socket.on('refresh_chat_list', handleRefreshChatList);
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('refresh_chat_list', handleRefreshChatList);
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, currentUserId]);

  const generateAvatar = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderChatItem = ({ item }: { item: ChatSummary }) => {
    const fullName = item.last_name ? `${item.first_name} ${item.last_name}` : item.first_name;
    
    return (
      <TouchableOpacity
        style={[styles.chatItem, { borderBottomColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB' }]}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: generateAvatar(fullName) }]}>
            <Text style={styles.avatarText}>
              {fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={[styles.timeText, { color: colors.icon }]}>
              {formatTime(item.last_message_time)}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                { color: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280' }
              ]}
              numberOfLines={1}
            >
              {item.last_message}
            </Text>
            {item.unread_count > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.tint }]}>
                <Text style={styles.unreadText}>
                  {item.unread_count > 99 ? '99+' : item.unread_count}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerText}>Messages</ThemedText>
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
            <Ionicons name="create-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { 
          backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' 
        }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.icon} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages..."
            placeholderTextColor={colors.icon}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={colors.icon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.user_id}
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={loading ? "hourglass-outline" : "chatbubbles-outline"} 
              size={64} 
              color={colors.icon} 
              style={styles.emptyIcon} 
            />
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              {loading ? 'Loading conversations...' : searchText ? 'No messages found' : 'No conversations yet'}
            </Text>
            {!searchText && !loading && (
              <TouchableOpacity onPress={handleNewChat} style={[styles.startChatButton, { backgroundColor: colors.tint }]}>
                <Text style={styles.startChatText}>Start a conversation</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  newChatButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  lastSeenText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  startChatButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});