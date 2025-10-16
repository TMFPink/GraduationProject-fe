import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SocketProvider, useSocket } from '@/src/contexts/socket-context';
import { isAuthenticated, setupSampleAuth } from '@/src/utils/sample-auth';

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
        
        // Check authentication and setup sample auth if needed
        const authenticated = await isAuthenticated();
        if (!authenticated) {
          console.log('Setting up sample authentication...');
          await setupSampleAuth();
        }
        
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
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SocketProvider>
      <RootLayoutInner />
    </SocketProvider>
  );
}
