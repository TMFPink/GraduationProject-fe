import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocket } from '../services/socket';
import { getUserData } from '../utils/auth';

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  initializeSocket: () => Promise<void>;
  disconnectSocket: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const initializeSocket = async () => {
    try {
      const userData = await getUserData();
      if (userData && userData.user_id) {
        console.log('🔄 Initializing socket for user:', userData.user_id);
        const newSocket = initSocket(userData.user_id);
        
        newSocket.on('connect', () => {
          console.log('🟢 Socket connected globally');
          setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
          console.log('🔴 Socket disconnected globally');
          setIsConnected(false);
        });

        setSocket(newSocket);
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      initializeSocket,
      disconnectSocket
    }}>
      {children}
    </SocketContext.Provider>
  );
};
