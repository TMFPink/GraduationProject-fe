import { Stack } from 'expo-router';
import React from 'react';

export default function userLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* <Stack.Screen name="editProfile" />
      <Stack.Screen name="guestProfile" /> */}
    </Stack>
  );
}
