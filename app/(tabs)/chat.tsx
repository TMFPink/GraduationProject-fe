import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSocket, initSocket } from '@src/services/socket';
import React, { useEffect, useState } from 'react';
import {
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

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  

  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const userId = 'c8b1eae0-4de0-418e-8653-c57a89b3805c';
  const receiverId = '25492b35-1985-4729-84ea-422040745d80';

  useEffect(() => {
    const socket = initSocket(userId);

    socket.on('connect', () => {
      console.log('🟢 Connected');
      setIsConnected(true);
      setLog((prev) => [...prev, '🟢 Connected to server']);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected');
      setIsConnected(false);
      setLog((prev) => [...prev, '🔴 Disconnected']);
    });

    socket.on('receive_message', (msg) => {
      console.log('📩 Received message:', msg);
      setLog((prev) => [...prev, `📩 From ${msg.sender_id}: ${msg.content}`]);
    });

    socket.on('message_sent', (msg) => {
      console.log('✅ Message sent:', msg);
      setLog((prev) => [...prev, `✅ Sent: ${msg.content}`]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('send_message', {
      sender_id: userId,
      receiver_id: receiverId,
      content: 'Hello from RN!',
    });
    setLog((prev) => [...prev, '📤 Message sent!']);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isUser ? styles.userMessage : styles.botMessage
    ]}>
      {item.isUser ? (
        <View style={[styles.messageBubble, styles.userBubble]}>
          <Text style={styles.messageTextUser}>{item.text}</Text>
        </View>
      ) : (
        <View style={[styles.messageBubble, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }]}>
          <Text style={[styles.messageTextBot, { color: colors.text }]}>{item.text}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <ThemedText type="title" style={styles.headerText}>Chat</ThemedText>
      </View>
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
        />
        
        <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF' }]}>
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: colorScheme === 'dark' ? '#374151' : '#F9FAFB',
              color: colors.text 
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={colors.icon}
            multiline
            maxLength={500}
          />
          <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()}>
            <View style={[styles.sendButton, { 
              backgroundColor: inputText.trim() ? colors.tint : '#9CA3AF' 
            }]}>
              <Text style={styles.sendButtonText}>Send</Text>
            </View>
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#8B5CF6',
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  messageTextBot: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
