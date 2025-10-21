import Constants from 'expo-constants';
import { io } from 'socket.io-client';

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:3000';
// const SOCKET_URL = 'http://localhost:3000';
let socket = null;

export const initSocket = (userId) => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🟢 Connected to server', socket.id);
    socket.emit('register', userId);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Disconnected from server');
  });

  return socket;
};

export const getSocket = () => socket;
