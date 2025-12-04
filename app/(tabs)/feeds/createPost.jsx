// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { postApi } from '@/src/api/post-api';
// import { useAuth } from '@/src/contexts/auth-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   Animated,
// } from 'react-native';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

// export default function CreatePostScreen() {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme ?? 'light'];
//   const router = useRouter();
//   const { user } = useAuth();
//   const richText = useRef();
  
//   // Form state
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [tags, setTags] = useState('');
  
//   // UI state
//   const [isPosting, setIsPosting] = useState(false);
//   const [showTitleInput, setShowTitleInput] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const animatedToolbarY = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
//       setKeyboardHeight(e.endCoordinates.height);
//       Animated.timing(animatedToolbarY, {
//         toValue: -e.endCoordinates.height,
//         duration: 250,
//         useNativeDriver: true,
//       }).start();
//     });
//     const hideSub = Keyboard.addListener('keyboardDidHide', () => {
//       setKeyboardHeight(0);
//       Animated.timing(animatedToolbarY, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: true,
//       }).start();
//     });

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   const handleClose = () => {
//     router.navigate('/feeds');
//   };

//   const handlePost = async () => {
//     // Get HTML content from RichEditor
//     const htmlContent = await richText.current?.getContentHtml();
    
//     // Validation
//     if (!htmlContent || htmlContent.trim() === '' || htmlContent.trim() === '<p></p>') {
//       Alert.alert('Error', 'Please enter some content for your post');
//       return;
//     }

//     try {
//       setIsPosting(true);

//       // Parse tags from comma-separated string
//       const tagArray = tags
//         .split(',')
//         .map(tag => tag.trim())
//         .filter(tag => tag.length > 0);

//       // Prepare post data - only include fields that have values
//       const postData = {
//         content: htmlContent,
//       };

//       if (title.trim()) {
//         postData.title = title.trim();
//       }

//       if (tagArray.length > 0) {
//         postData.tags = tagArray;
//       }

//       console.log('Creating post with data:', postData);

//       // Call API
//       const response = await postApi.createPost(postData);
//       console.log('API Response:', response);

//       // Check if post was created successfully
//       if (response && response.metadata && response.metadata.post_id) {
//         console.log('Post created successfully:', response.metadata);
        
//         Alert.alert('Success', 'Post created successfully!', [
//           { text: 'OK', onPress: () => router.navigate('/feeds') }
//         ]);
//       } else if (response && response.message && !response.metadata) {
//         throw new Error(response.message);
//       } else {
//         throw new Error('Failed to create post');
//       }
//     } catch (error) {
//       console.error('Error creating post:', error);
//       console.error('Error details:', error.response || error);
      
//       Alert.alert(
//         'Error',
//         error.message || 'Failed to create post. Please try again.'
//       );
//     } finally {
//       setIsPosting(false);
//     }
//   };

//   const canPost = content.trim().length > 0 && !isPosting;

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.container}
//       >
//         <ThemedView style={styles.container}>
//           {/* Header */}
//           <View style={styles.headerContainer}>
//             <View style={[styles.header, { backgroundColor: colors.background }]}>
//               <TouchableOpacity 
//                 onPress={handleClose} 
//                 style={styles.closeButton}
//                 disabled={isPosting}
//               >
//                 <View style={[styles.iconButton, { backgroundColor: colors.border + '40' }]}>
//                   <Ionicons name="close" size={24} color={colors.text} />
//                 </View>
//               </TouchableOpacity>
              
//               <View style={styles.headerCenter}>
//                 <ThemedText type="title" style={[styles.headerTitle, { color: colors.text }]}>
//                   Create Post
//                 </ThemedText>
//                 <View style={[styles.headerUnderline, { backgroundColor: colors.tint }]} />
//               </View>

//               <TouchableOpacity
//                 onPress={handlePost}
//                 disabled={!canPost}
//                 style={[
//                   styles.postButton,
//                   { 
//                     backgroundColor: canPost ? colors.tint : colors.border + '60',
//                     opacity: canPost ? 1 : 0.5 
//                   }
//                 ]}
//               >
//                 {isPosting ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <ThemedText style={styles.postButtonText}>Post</ThemedText>
//                 )}
//               </TouchableOpacity>
//             </View>
//             <View style={[styles.headerDivider, { backgroundColor: colors.border }]} />
//           </View>

//           <KeyboardAwareScrollView
//             style={styles.content}
//             contentContainerStyle={styles.scrollContent}
//             keyboardShouldPersistTaps="handled"
//             extraScrollHeight={100}
//           >
//             {/* User Info Card */}
//             <View style={[styles.userCard, { backgroundColor: colors.background }]}>
//               <View style={styles.userInfo}>
//                 <View style={[styles.avatarContainer, { backgroundColor: colors.tint + '40' }]}>
//                   {user?.avatar_url ? (
//                     <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
//                   ) : (
//                     <Ionicons name="person" size={24} color={colors.tint} />
//                   )}
//                 </View>
//                 <View style={styles.userDetails}>
//                   <ThemedText style={[styles.username, { color: colors.text }]}>
//                     {user?.username || 'Your Name'}
//                   </ThemedText>
//                   <View style={[styles.visibilityBadge, { backgroundColor: colors.tint + '15' }]}>
//                     <Ionicons name="globe-outline" size={12} color={colors.tint} />
//                     <ThemedText style={[styles.visibilityText, { color: colors.tint }]}>
//                       Public
//                     </ThemedText>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* Title Input (Optional) */}
//             {showTitleInput ? (
//               <TextInput
//                 style={[styles.titleInput, { 
//                   color: colors.text,
//                   borderBottomColor: colors.border 
//                 }]}
//                 placeholder="Post title (optional)"
//                 placeholderTextColor={colors.muted + '80'}
//                 value={title}
//                 onChangeText={setTitle}
//                 maxLength={100}
//               />
//             ) : (
//               <TouchableOpacity 
//                 style={[styles.addTitleButton, { borderColor: colors.border }]}
//                 onPress={() => setShowTitleInput(true)}
//               >
//                 <Ionicons name="text-outline" size={20} color={colors.tint} />
//                 <ThemedText style={[styles.addTitleText, { color: colors.tint }]}>
//                   Add title (optional)
//                 </ThemedText>
//               </TouchableOpacity>
//             )}

//             {/* Rich Text Editor */}
//             <View style={[styles.editorContainer, { borderColor: colors.border }]}>
//               <RichEditor
//                 ref={richText}
//                 placeholder="What's on your mind? Use the toolbar below to format your post..."
//                 onChange={setContent}
//                 editorStyle={{ 
//                   backgroundColor: colors.background,
//                   color: colors.text,
//                   contentCSSText: `
//                     font-size: 16px; 
//                     min-height: 250px; 
//                     padding: 12px;
//                     color: ${colors.text};
//                   ` 
//                 }}
//                 style={[styles.richEditor, { backgroundColor: colors.background }]}
//                 initialHeight={250}
//               />
//             </View>

//             {/* Tags Input */}
//             <View style={[styles.tagsContainer, { backgroundColor: colors.background }]}>
//               <View style={styles.tagsHeader}>
//                 <Ionicons name="pricetag-outline" size={18} color={colors.tint} />
//                 <ThemedText style={[styles.tagsLabel, { color: colors.text }]}>
//                   Tags
//                 </ThemedText>
//               </View>
//               <TextInput
//                 style={[styles.tagsInput, { 
//                   color: colors.text,
//                   borderColor: colors.border 
//                 }]}
//                 placeholder="e.g., fitness, coding, travel (comma separated)"
//                 placeholderTextColor={colors.muted + '80'}
//                 value={tags}
//                 onChangeText={setTags}
//               />
//             </View>

//             {/* Spacer for toolbar */}
//             <View style={{ height: 100 }} />
//           </KeyboardAwareScrollView>

//           {/* Floating Toolbar */}
//           <Animated.View 
//             style={[
//               styles.toolbarContainer, 
//               { 
//                 backgroundColor: colors.background,
//                 borderTopColor: colors.border,
//                 transform: [{ translateY: animatedToolbarY }]
//               }
//             ]}
//           >
//             <TouchableOpacity 
//               style={styles.closeKeyboardButton} 
//               onPress={() => Keyboard.dismiss()}
//             >
//               <ThemedText style={[styles.doneText, { color: colors.tint }]}>Done</ThemedText>
//             </TouchableOpacity>
            
//             <RichToolbar
//               editor={richText}
//               actions={[
//                 actions.setBold,
//                 actions.setItalic,
//                 actions.setUnderline,
//                 actions.insertBulletsList,
//                 actions.insertOrderedList,
//                 actions.insertLink,
//                 actions.heading1,
//                 actions.undo,
//                 actions.redo,
//               ]}
//               iconTint={colors.text}
//               selectedIconTint={colors.tint}
//               style={[styles.toolbar, { backgroundColor: colors.background }]}
//             />
//           </Animated.View>
//         </ThemedView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerContainer: {
//     paddingBottom: 0,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     letterSpacing: 0.3,
//   },
//   headerUnderline: {
//     width: 40,
//     height: 3,
//     borderRadius: 2,
//     marginTop: 4,
//   },
//   headerDivider: {
//     height: 1,
//     width: '100%',
//   },
//   closeButton: {
//     padding: 4,
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   postButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     borderRadius: 24,
//     minWidth: 80,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   postButtonText: {
//     color: 'white',
//     fontSize: 15,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   content: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   userCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatarContainer: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 14,
//     overflow: 'hidden',
//   },
//   avatarImage: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//   },
//   userDetails: {
//     flex: 1,
//     gap: 6,
//   },
//   username: {
//     fontSize: 17,
//     fontWeight: '700',
//     letterSpacing: 0.2,
//   },
//   visibilityBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 16,
//     gap: 5,
//   },
//   visibilityText: {
//     fontSize: 12,
//     fontWeight: '600',
//     letterSpacing: 0.3,
//   },
//   addTitleButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderRadius: 12,
//     borderStyle: 'dashed',
//     marginBottom: 16,
//     gap: 8,
//   },
//   addTitleText: {
//     fontSize: 15,
//     fontWeight: '500',
//   },
//   titleInput: {
//     fontSize: 20,
//     fontWeight: '600',
//     lineHeight: 28,
//     paddingVertical: 12,
//     paddingHorizontal: 4,
//     marginBottom: 16,
//     borderBottomWidth: 1,
//   },
//   editorContainer: {
//     borderWidth: 1,
//     borderRadius: 12,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   richEditor: {
//     minHeight: 250,
//   },
//   tagsContainer: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     gap: 10,
//   },
//   tagsHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   tagsLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   tagsInput: {
//     fontSize: 15,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderWidth: 1,
//     borderRadius: 8,
//   },
//   toolbarContainer: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     borderTopWidth: 1,
//     paddingBottom: Platform.OS === 'ios' ? 20 : 5,
//   },
//   closeKeyboardButton: {
//     alignSelf: 'flex-end',
//     padding: 10,
//     marginRight: 10,
//   },
//   doneText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   toolbar: {
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//   },
// });