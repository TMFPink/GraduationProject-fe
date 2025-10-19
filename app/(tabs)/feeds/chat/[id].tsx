import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatApi } from '@/src/api/chat-api';
import { useSocket } from '@/src/contexts/socket-context';
import { ChatUser, Message } from '@/src/types/chat';
import { getUserData } from '@/src/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatConversationScreen() {

  const PAGE_SIZE = 15;

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id: receiverId, userName } = useLocalSearchParams();
  const { socket, isConnected } = useSocket();

  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

  const initialLoadedRef = React.useRef(false);
  const scrollOffsetRef = useRef(0);
  const prevContentHeightRef = useRef(0);
  const hasScrolledToBottomRef = useRef(false);



  // Chat user data
  const chatUser: ChatUser = {
    id: receiverId as string || '1',
    name: userName as string || 'Chat User',
    isOnline: true,
  };

  // Initialize chat

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const userData = await getUserData();
        if (userData?.user_id) {
          setCurrentUserId(userData.user_id);

          await loadChatHistory(1, true);          // strictly await page 1
          initialLoadedRef.current = true;          // allow pagination afterwards
          await chatApi.markMessagesAsRead(receiverId as string);
        }
      } catch (e) {
        console.error('Error initializing chat:', e);
        Alert.alert('Error', 'Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };
    initializeChat();
  }, [receiverId]);

  // Load chat history (latest first)
  const loadChatHistory = async (page: number, isInitial = false) => {
    try {

      if (!isInitial) {
        setLoadingMoreMessages(true);
        setIsLoadingOldMessages(true); // mark loading older data
      }

      const res = await chatApi.getChatHistory(receiverId as string, page, PAGE_SIZE);

      if (res.statusCode === 200 && res.metadata?.messages) {
        const raw = res.metadata.messages as Message[];
        const asc = [...raw].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(prev => (isInitial ? asc : [...asc, ...prev]));
        setHasMoreMessages(raw.length === PAGE_SIZE);
        setCurrentPage(page);
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading chat history:', err);
    } finally {
      if (!isInitial) {
        setLoadingMoreMessages(false);
        setTimeout(() => setIsLoadingOldMessages(false), 300);
      }
    }
  };


  // Load older messages on scroll up
  const handleLoadMore = async () => {
    // Block early triggers on mount
    if (!initialLoadedRef.current) return;
    if (loadingMoreMessages || !hasMoreMessages) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await loadChatHistory(nextPage);
  };


  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleReceiveMessage = async (msg: any) => {
      const newMessage: Message = {
        message_id: Date.now().toString(),
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        is_read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev,newMessage]);

      // Auto-scroll to bottom when a new message arrives
      setTimeout(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      }, 100);

      await chatApi.markMessagesAsRead(receiverId as string);

    };

    const handleUserTyping = (data: any) => {
      if (data.user_id !== currentUserId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, currentUserId]);

  const sendMessage = () => {
    if (!inputText.trim() || !currentUserId || !socket) return;

    const newMessage: Message = {
      message_id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: receiverId as string,
      content: inputText.trim(),
      is_read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100); // short delay to allow layout update

    socket.emit('send_message', {
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: inputText.trim(),
    });

    setInputText('');
  };


  const handleTyping = (text: string) => {
    setInputText(text);
    if (socket && text.length > 0 && currentUserId) {
      socket.emit('typing', {
        user_id: currentUserId,
        receiver_id: receiverId,
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const generateAvatar = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.sender_id === currentUserId;

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.userMessage : styles.botMessage
      ]}>
        {!isCurrentUser && (
          <View style={styles.avatarContainer}>
            <View style={[styles.messageAvatarPlaceholder, { backgroundColor: generateAvatar(chatUser.name) }]}>
              <Text style={styles.messageAvatarText}>
                {chatUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Text>
            </View>
          </View>
        )}

        <View style={[
          styles.messageBubble,
          isCurrentUser
            ? [styles.userBubble, { backgroundColor: colors.tint }]
            : [styles.botBubble, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: isCurrentUser ? '#FFFFFF' : colors.text }
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            { 
              color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : colors.icon ,
              alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'
            }
            
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMoreMessages) return null;
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading older messages...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/chat')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={[styles.headerAvatarPlaceholder, { backgroundColor: generateAvatar(chatUser.name) }]}>
            <Text style={styles.headerAvatarText}>
              {chatUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{chatUser.name}</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'typing...' : chatUser.isOnline ? 'online' : 'offline'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Chat area */}
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id}
          maintainVisibleContentPosition={{
            minIndexForVisible: 1,
          }}

          ListHeaderComponent={
            loadingMoreMessages ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading older messages...</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 16 }}
          onScroll={({ nativeEvent }) => {
            scrollOffsetRef.current = nativeEvent.contentOffset.y;

            if (
              nativeEvent.contentOffset.y <= 0 &&
              !loadingMoreMessages &&
              hasMoreMessages
            ) {
              handleLoadMore();
            }
          }}
          scrollEventThrottle={1000}
          onContentSizeChange={(width, height) => {
            // --- Case 1: user is loading old messages (scroll up) ---
            if (isLoadingOldMessages && flatListRef.current) {
              const heightDiff = height - prevContentHeightRef.current;
              if (heightDiff > 0) {
                flatListRef.current.scrollToOffset({
                  offset: heightDiff,
                  animated: false,
                });
              }
            }

            // --- Case 2: first time entering the chat ---
            else if (
              !isLoadingOldMessages &&
              flatListRef.current &&
              !hasScrolledToBottomRef.current &&
              !loadingMoreMessages
            ) {
              console.log('Scrolling to bottom on initial load');

              // Delay scroll until layout completes
              requestAnimationFrame(() => {
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: false });
                  hasScrolledToBottomRef.current = true;
                }, 200); // tiny delay (50ms is enough)
              });
            }

            prevContentHeightRef.current = height;
          }}
        />



        <View style={[
          styles.inputContainer,
          { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' }
        ]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB',
                color: colors.text
              }
            ]}
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={colors.icon}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? colors.tint : '#9CA3AF' }
            ]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 0.5,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
  },
});