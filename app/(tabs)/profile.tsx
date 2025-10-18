import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/src/contexts/auth-context';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface UserInfo {
  name: string;
  email: string;
  role: string;
  joinDate: string;
  stats: {
    projects: number;
    completed: number;
    inProgress: number;
  };
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  

  // Use actual user data from auth context
  const userInfo = user ? {
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    role: user.role_id, // You might want to map this to a readable role name
    phone: user.phone_number,
    id: user.user_id,
    stats: {
      projects: 12, // These would come from your API
      completed: 8,
      inProgress: 4,
    },
    joinDate: 'January 2024', // You might want to calculate this from user creation date
  } : null;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here.');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login')
  };

  const StatCard = ({ title, value, color }: { title: string; value: number; color: string }) => (
    <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#FFFFFF' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const SettingItem = ({ 
    title, 
    value, 
    onToggle, 
    isSwitch = false, 
    onPress 
  }: { 
    title: string; 
    value?: boolean | string; 
    onToggle?: (value: boolean) => void; 
    isSwitch?: boolean;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#FFFFFF' }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      {isSwitch ? (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: colors.tint }}
          thumbColor={value ? '#FFFFFF' : '#f4f3f4'}
        />
      ) : (
        <Text style={[styles.settingValue, { color: colors.icon }]}>
          {value as string} →
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <ThemedText type="title" style={styles.headerText}>Profile</ThemedText>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {userInfo ? (
          <>
            {/* Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#FFFFFF' }]}>
              <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                <Text style={styles.avatarText}>{userInfo.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{userInfo.name}</Text>
                <Text style={[styles.userEmail, { color: colors.icon }]}>{userInfo.email}</Text>
                <Text style={[styles.userRole, { color: colors.tint }]}>{userInfo.role}</Text>
                <Text style={[styles.joinDate, { color: colors.icon }]}>Member since {userInfo.joinDate}</Text>
              </View>
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: colors.tint }]}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <StatCard title="Total Projects" value={userInfo.stats.projects} color={colors.tint} />
              <StatCard title="Completed" value={userInfo.stats.completed} color="#10B981" />
              <StatCard title="In Progress" value={userInfo.stats.inProgress} color="#F59E0B" />
            </View>
          </>
        ) : (
          <View style={[styles.profileCard, { backgroundColor: colorScheme === 'dark' ? '#374151' : '#FFFFFF' }]}>
            <Text style={[styles.userName, { color: colors.text }]}>Loading user data...</Text>
          </View>
        )}

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <SettingItem
            title="Notifications"
            value={notifications}
            onToggle={setNotifications}
            isSwitch={true}
          />
          
          <SettingItem
            title="Dark Mode"
            value={darkMode}
            onToggle={setDarkMode}
            isSwitch={true}
          />
          
          <SettingItem
            title="Privacy Policy"
            value="View"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content would be shown here.')}
          />
          
          <SettingItem
            title="Terms of Service"
            value="View"
            onPress={() => Alert.alert('Terms of Service', 'Terms of service content would be shown here.')}
          />
          
          <SettingItem
            title="Help & Support"
            value="Contact"
            onPress={() => Alert.alert('Help & Support', 'Support contact information would be shown here.')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: '#EF4444' }]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  settingsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingTitle: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    fontSize: 16,
  },
  logoutButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});