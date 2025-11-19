import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/contexts/auth-context';
import { authApi } from '@/src/api/auth-api';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const router = useRouter();
  const { user, setCurrentUser } = useAuth();

  // Form states
  const [username, setUsername] = useState('');
  const [userTag, setUserTag] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  const [avatarBinary, setAvatarBinary] = useState('');
  const [coverUri, setCoverUri] = useState('');
  const [coverBinary, setCoverBinary] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Initialize form
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setUserTag(user.userTag || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || '');
      setAvatarUri(user.avatar_url || '');
      setCoverUri(user.cover_url || '');
      setInitializing(false);
    }
  }, [user]);

  const handleBack = () => router.back();

  // Avatar pickers
  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission Required', 'Please allow gallery access.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setAvatarBinary(result.assets[0].base64 || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick avatar.');
    }
  };

  const handleTakeAvatarPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission Required', 'Please allow camera access.');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
        setAvatarBinary(result.assets[0].base64 || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleEditAvatar = () => {
    Alert.alert('Change Avatar', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakeAvatarPhoto },
      { text: 'Choose from Library', onPress: handlePickAvatar },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Cover pickers
  const handlePickCover = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission Required', 'Please allow gallery access.');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
        setCoverBinary(result.assets[0].base64 || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick cover image.');
    }
  };

  const handleTakeCoverPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return Alert.alert('Permission Required', 'Please allow camera access.');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setCoverUri(result.assets[0].uri);
        setCoverBinary(result.assets[0].base64 || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handleEditCover = () => {
    Alert.alert('Change Cover', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakeCoverPhoto },
      { text: 'Choose from Library', onPress: handlePickCover },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      return Alert.alert('Validation Error', 'Username and email are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert('Validation Error', 'Please enter a valid email.');
    }

    try {
      setLoading(true);

      const updateData = {
        username: username.trim(),
        email: email.trim(),
      };

      if (userTag.trim()) updateData.userTag = userTag.trim();
      if (phoneNumber.trim()) updateData.phone_number = phoneNumber.trim();
      if (avatarBinary) updateData.avatar = avatarBinary;
      if (coverBinary) updateData.cover = coverBinary;

      console.log('=== UPDATING PROFILE ===');
      console.log('Update data:', updateData);

      await authApi.updateProfile(updateData);

      const updatedUser = await authApi.getCurrentUser();
      setCurrentUser(updatedUser.metadata);

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>{'< Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover */}
        <View style={styles.coverContainer}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          <TouchableOpacity
            style={styles.editCoverButton}
            onPress={handleEditCover}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar} />
          )}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={handleEditAvatar}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>User Tag</Text>
            <TextInput
              style={styles.input}
              value={userTag}
              onChangeText={setUserTag}
              placeholder="Enter user tag (e.g., @username)"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number (optional)"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  coverContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: '#E08B7E',
  },
  editCoverButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginTop: -40,
    marginLeft: 16,
    width: 80,
    height: 80,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#C5C5C5',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C5C5C5',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#fff',
    borderWidth: 2,
  },
  editIcon: {
    fontSize: 18,
  },
  formContainer: {
    padding: 16,
    marginTop: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 0,
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfileScreen;