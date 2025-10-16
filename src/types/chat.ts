export interface ChatSummary {
  user_id: string;
  first_name: string;
  last_name?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Message {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface User {
  user_id: string;
  first_name: string;
  last_name?: string;
  email: string;
  // Add other user fields as needed
}
