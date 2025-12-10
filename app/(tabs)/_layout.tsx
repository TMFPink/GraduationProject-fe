import { Tabs } from 'expo-router';
import React from 'react';
import { useEffect } from 'react';
import * as NavigationBar from 'expo-navigation-bar';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
useEffect(() => {
    const configureNavBar = async () => {
      // 1. Hide the bottom navigation bar
      await NavigationBar.setVisibilityAsync('hidden');
      
      // 2. (Optional) Set behavior so it stays hidden but reveals on swipe
      // 'overlay-swipe' allows the bar to float over content when swiped up, then hide again
      // await NavigationBar.setBehaviorAsync('overlay-swipe');
    };

    configureNavBar();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          height: 100,
          // position: 'absolute',
          backgroundColor: '#F2CC0F',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: '#212121',
        tabBarInactiveTintColor: '#ffffffff',
        headerShown: false
      }}
    >
      <Tabs.Screen
        name="feeds"
        options={{
          title: 'Feeds',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="decks"
        options={{
          title: 'Decks',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="layers-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="searchs"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify-expand" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="collections"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="userpage"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
