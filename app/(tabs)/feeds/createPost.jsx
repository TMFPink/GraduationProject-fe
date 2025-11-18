import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { postApi } from '@/src/api/post-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker'; // Uncomment when you install: npx expo install expo-image-picker
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function CreatePostScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  
  // UI state
  const [isPosting, setIsPosting] = useState(false);
  const [showTitleInput, setShowTitleInput] = useState(false);

  const handleClose = () => {
    router.back();
  };

  const handlePost = async () => {
    // Validation
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    try {
      setIsPosting(true);

      // Parse tags from comma-separated string
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Prepare post data - only include fields that have values
      const postData = {
        content: content.trim(),
      };

      if (title.trim()) {
        postData.title = title.trim();
      }

      if (thumbnail) {
        postData.thumbnail = thumbnail;
      }

      if (selectedMedia) {
        postData.media_url = selectedMedia;
      }

      if (tagArray.length > 0) {
        postData.tags = tagArray;
      }

      console.log('Creating post with data:', postData);

      // Call API
      const response = await postApi.createPost(postData);
      console.log('API Response:', response);

      // Check if post was created successfully
      if (response && response.metadata && response.metadata.post_id) {
        console.log('Post created successfully:', response.metadata);
        
        // Navigate back to feeds
        router.navigate('(tabs)/feeds/index');
      } else if (response && response.message && !response.metadata) {
        // API returned an error message
        throw new Error(response.message);
      } else {
        // Unexpected response format
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.response || error);
      
      Alert.alert(
        'Error',
        error.message || 'Failed to create post. Please try again.'
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleMediaUpload = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload images.'
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedMedia(asset.uri);
        
        // You can also set thumbnail to the same URI or a different one
        setThumbnail(asset.uri);
        
        // TODO: Upload to your server/cloud storage and get URL
        console.log('Selected media:', asset.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const canPost = content.trim().length > 0 && !isPosting;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ThemedView style={styles.container}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={[styles.header, { backgroundColor: colors.background }]}>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                disabled={isPosting}
              >
                <View style={[styles.iconButton, { backgroundColor: colors.border + '40' }]}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
                  Create Post
                </ThemedText>
                <View style={[styles.headerUnderline, { backgroundColor: colors.tint }]} />
              </View>

              <TouchableOpacity
                onPress={handlePost}
                disabled={!canPost}
                style={[
                  styles.postButton,
                  { 
                    backgroundColor: canPost ? colors.tint : colors.border + '60',
                    opacity: canPost ? 1 : 0.5 
                  }
                ]}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ThemedText style={styles.postButtonText}>Post</ThemedText>
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* User Info Card */}
            <View style={[styles.userCard, { backgroundColor: colors.background }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.tint + '40' }]}>
                  <Ionicons name="person" size={24} color={colors.tint} />
                </View>
                <View style={styles.userDetails}>
                  <ThemedText style={[styles.username, { color: colors.text }]}>
                    Your Name
                  </ThemedText>
                  <View style={[styles.visibilityBadge, { backgroundColor: colors.tint + '15' }]}>
                    <Ionicons name="globe-outline" size={12} color={colors.tint} />
                    <ThemedText style={[styles.visibilityText, { color: colors.tint }]}>
                      Public
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Title Input (Optional) */}
            {showTitleInput ? (
              <TextInput
                style={[styles.titleInput, { 
                  color: colors.text,
                  borderBottomColor: colors.border 
                }]}
                placeholder="Post title (optional)"
                placeholderTextColor={colors.muted + '80'}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            ) : (
              <TouchableOpacity 
                style={[styles.addTitleButton, { borderColor: colors.border }]}
                onPress={() => setShowTitleInput(true)}
              >
                <Ionicons name="text-outline" size={20} color={colors.tint} />
                <ThemedText style={[styles.addTitleText, { color: colors.tint }]}>
                  Add title (optional)
                </ThemedText>
              </TouchableOpacity>
            )}

            {/* Content Input */}
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.muted + '80'}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
            />

            {/* Tags Input */}
            <View style={[styles.tagsContainer, { backgroundColor: colors.background }]}>
              <View style={styles.tagsHeader}>
                <Ionicons name="pricetag-outline" size={18} color={colors.tint} />
                <ThemedText style={[styles.tagsLabel, { color: colors.text }]}>
                  Tags
                </ThemedText>
              </View>
              <TextInput
                style={[styles.tagsInput, { 
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                placeholder="e.g., fitness, coding, travel (comma separated)"
                placeholderTextColor={colors.muted + '80'}
                value={tags}
                onChangeText={setTags}
              />
            </View>

            {/* Media Preview */}
            {selectedMedia ? (
              <View style={styles.mediaContainer}>
                <Image source={{ uri: selectedMedia }} style={styles.mediaPreview} />
                <TouchableOpacity
                  style={styles.removeMediaButton}
                  onPress={() => {
                    setSelectedMedia(null);
                    setThumbnail(null);
                  }}
                >
                  <View style={[styles.removeMediaIcon, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
                    <Ionicons name="close" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              /* Media Upload Card */
              <TouchableOpacity
                style={[styles.mediaCard, { 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderStyle: 'dashed'
                }]}
                onPress={handleMediaUpload}
                activeOpacity={0.7}
              >
                <View style={[styles.mediaIconContainer, { backgroundColor: colors.tint + '15' }]}>
                  <Ionicons name="image" size={32} color={colors.tint} />
                </View>
                <ThemedText style={[styles.mediaTitle, { color: colors.text }]}>
                  Add photo or video
                </ThemedText>
                <ThemedText style={[styles.mediaSubtitle, { color: colors.muted }]}>
                  Tap to upload from gallery
                </ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Bottom Toolbar */}
          <View style={[styles.toolbar, { 
            backgroundColor: colors.background,
            borderTopColor: colors.border 
          }]}>
            <View style={styles.toolbarContent}>
              <ThemedText style={[styles.toolbarLabel, { color: colors.muted }]}>
                Add to post
              </ThemedText>
              <View style={styles.toolbarButtons}>
                <TouchableOpacity 
                  style={[styles.toolbarButton, { backgroundColor: colors.tint + '15' }]}
                  onPress={handleMediaUpload}
                >
                  <Ionicons name="image" size={20} color={colors.tint} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolbarButton, { backgroundColor: colors.tint + '15' }]}
                  onPress={() => setShowTitleInput(true)}
                >
                  <Ionicons name="text" size={20} color={colors.tint} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolbarButton, { backgroundColor: colors.tint + '15' }]}
                  onPress={() => {
                    // Focus on tags input
                  }}
                >
                  <Ionicons name="pricetag" size={20} color={colors.tint} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerUnderline: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginTop: 4,
  },
  headerDivider: {
    height: 1,
    width: '100%',
  },
  closeButton: {
    padding: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  userCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
    gap: 6,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 5,
  },
  visibilityText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  addTitleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 8,
  },
  addTitleText: {
    fontSize: 15,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
  },
  textInput: {
    fontSize: 17,
    lineHeight: 26,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  tagsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagsLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tagsInput: {
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  mediaPreview: {
    width: '100%',
    height: 320,
    borderRadius: 20,
  },
  removeMediaButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  removeMediaIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaCard: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  mediaIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  mediaSubtitle: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  toolbarContent: {
    gap: 12,
  },
  toolbarLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  toolbarButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});