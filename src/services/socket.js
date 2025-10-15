import { SOCKET_URL } from '@env';
import { io } from 'socket.io-client';

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
