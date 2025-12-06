import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/src/contexts/auth-context';
import { SocketProvider, useSocket } from '@/src/contexts/socket-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const { initializeSocket } = useSocket();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Initialize socket connection
        await initializeSocket();
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {/* <StatusBar style="auto"/> */}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SocketProvider>
        <RootLayoutInner />
      </SocketProvider>
    </AuthProvider>
  );
}
