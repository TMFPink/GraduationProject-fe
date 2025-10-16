import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { chatApi } from '@/src/api/chat-api';
import { ChatUser, Message } from '@/src/types/chat';
import { getUserData } from '@/src/utils/auth';
import { Ionicons } from '@expo/vector-icons';
import { getSocket, initSocket } from '@src/services/socket';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id: receiverId, userName } = useLocalSearchParams();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Chat user data
  const chatUser: ChatUser = {
    id: receiverId as string || '1',
    name: userName as string || 'Chat User',
    isOnline: true,
  };

  // Load current user data and chat history
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get current user data
        const userData = await getUserData();
        if (userData && userData.user_id) {
          setCurrentUserId(userData.user_id);
          
          // Load chat history
          const chatHistory = await chatApi.getChatHistory(receiverId as string);
          if (chatHistory.statusCode === 200 && chatHistory.metadata) {
            setMessages(chatHistory.metadata);
          }

          // Mark messages as read
          await chatApi.markMessagesAsRead(receiverId as string);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        Alert.alert('Error', 'Failed to load chat history');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [receiverId]);

  // Socket connection
  useEffect(() => {
    if (!currentUserId) return;

    const socket = initSocket(currentUserId);

    socket.on('connect', () => {
      console.log('🟢 Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected');
      setIsConnected(false);
    });

    socket.on('receive_message', (msg) => {
      console.log('📩 Received message:', msg);
      const newMessage: Message = {
        message_id: Date.now().toString(),
        sender_id: msg.sender_id,
        receiver_id: msg.receiver_id,
        content: msg.content,
        is_read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('message_sent', (msg) => {
      console.log('✅ Message sent:', msg);
    });

    socket.on('user_typing', (data) => {
      if (data.user_id !== currentUserId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId]);

  const sendMessage = () => {
    if (!inputText.trim() || !currentUserId) return;

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

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: inputText.trim(),
      });
    }

    setInputText('');
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    
    const socket = getSocket();
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
                {chatUser.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
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
            { color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : colors.icon }
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.tint,
        borderBottomColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB'
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          {chatUser.avatar ? (
            <Image source={{ uri: chatUser.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatarPlaceholder, { backgroundColor: generateAvatar(chatUser.name) }]}>
              <Text style={styles.headerAvatarText}>
                {chatUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{chatUser.name}</Text>
            <Text style={styles.headerStatus}>
              {isTyping ? 'typing...' : chatUser.isOnline ? 'online' : `last seen ${chatUser.lastSeen}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.message_id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        />
        
        <View style={[styles.inputContainer, { 
          backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB'
        }]}>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB',
              color: colors.text 
            }]}
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
            style={[styles.sendButton, { 
              backgroundColor: inputText.trim() ? colors.tint : '#9CA3AF' 
            }]}
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
    alignSelf: 'flex-end',
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
});