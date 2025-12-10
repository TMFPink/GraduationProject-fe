// import { postApi } from '@/src/api/post-api';
// import { useAuth } from '@/src/contexts/auth-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text, // Changed from ThemedText
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   Image,
//   Dimensions,
//   ScrollView,
// } from 'react-native';
// import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const SCREEN_WIDTH = Dimensions.get('window').width;

// // --- Static Colors Definition ---
// const COLORS = {
//   background: '#FFFFFF',
//   text: '#000000',
//   muted: '#8E8E93',
//   border: '#E5E5EA',
//   tint: '#007AFF', // Standard Blue
//   tintDisabled: '#E5E5EA',
// };

// // --- Utility Functions ---

// const getFileExtension = (uri) => {
//   const basename = uri.split(/[\\/]/).pop();
//   const match = /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : null;
//   return match ? match[0].toLowerCase() : 'jpg';
// };

// const getMimeType = (uri) => {
//   const ext = getFileExtension(uri);
//   const mimeTypes = {
//     'jpg': 'image/jpeg', 
//     'jpeg': 'image/jpeg', 
//     'png': 'image/png', 
//     'webp': 'image/webp', 
//     'gif': 'image/gif',
//   };
//   return mimeTypes[ext] || 'image/jpeg';
// };

// // --- Main Component ---

// export default function CreatePostScreen() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const richText = useRef();
  
//   // Form State
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [tags, setTags] = useState('');
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [imageAspectRatio, setImageAspectRatio] = useState(1);
  
//   // UI State
//   const [isPosting, setIsPosting] = useState(false);
//   const [keyboardHeight, setKeyboardHeight] = useState(0);
  
//   // Handle Keyboard Logic
//   useEffect(() => {
//     const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
//     const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

//     const showSub = Keyboard.addListener(showEvent, (e) => {
//       setKeyboardHeight(e.endCoordinates.height);
//     });
//     const hideSub = Keyboard.addListener(hideEvent, () => {
//       setKeyboardHeight(0);
//     });

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   const handleClose = () => {
//     // If user has typed anything, warn them before closing
//     if (content.length > 0 || title.length > 0 || selectedImage) {
//       Alert.alert("Discard Post?", "You have unsaved changes.", [
//         { text: "Keep Editing", style: "cancel" },
//         { text: "Discard", style: "destructive", onPress: () => router.navigate('/feeds') }
//       ]);
//     } else {
//       router.navigate('/feeds');
//     }
//   };

//   const pickImage = async () => {
//     try {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== 'granted') return Alert.alert('Permission Denied', 'Camera roll permission required.');

//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: false, // False ensures we get the original aspect ratio
//         quality: 0.8,
//       });

//       if (!result.canceled && result.assets && result.assets.length > 0) {
//         const asset = result.assets[0];
//         // 10MB Limit Check
//         if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
//              return Alert.alert('File Too Large', 'Please select an image smaller than 10MB.');
//         }
        
//         setImageAspectRatio(asset.width / asset.height);
//         setSelectedImage(asset.uri);
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to pick image.');
//     }
//   };

//   const handlePost = async () => {
//     const htmlContent = await richText.current?.getContentHtml();
    
//     // Validation
//     if (!htmlContent || htmlContent.trim() === '' || htmlContent.trim() === '<p></p>') {
//       return Alert.alert('Missing Content', 'Please write something before posting.');
//     }

//     try {
//       setIsPosting(true);
//       const formData = new FormData();
      
//       formData.append('content', htmlContent);
      
//       if (title.trim()) {
//         formData.append('title', title.trim());
//       }

//       // Process Tags
//       const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
//       tagArray.forEach(tag => formData.append('tags', tag));

//       // Process Image
//       if (selectedImage) {
//         const fileName = `photo_${Date.now()}.${getFileExtension(selectedImage)}`;
        
//         // Android often needs the raw uri, iOS sometimes prefers stripping file://
//         const uriToUpload = Platform.OS === 'android' ? selectedImage : selectedImage.replace('file://', '');

//         formData.append('thumbnail', {
//           uri: uriToUpload,
//           name: fileName,
//           type: getMimeType(selectedImage),
//         });
//       }

//       // API Call
//       const response = await postApi.createPost(formData);
      
//       if (response && (response.statusCode === 201 || response.metadata)) {
//         router.navigate('/feeds');
//       } else {
//         throw new Error(response.message || 'Failed to create post');
//       }
//     } catch (error) {
//       Alert.alert('Error', 'Failed to upload post. Please check your network connection.');
//       console.error(error);
//     } finally {
//       setIsPosting(false);
//     }
//   };

//   const canPost = content.trim().length > 0 && !isPosting;

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]} edges={['top', 'left', 'right']}>
      
//       {/* 1. HEADER */}
//       <View style={[styles.header, { borderBottomColor: COLORS.border }]}>
//         <TouchableOpacity onPress={handleClose} disabled={isPosting} hitSlop={10}>
//           <Text style={{ fontSize: 16, color: COLORS.text }}>Cancel</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={handlePost}
//           disabled={!canPost}
//           style={[styles.postButton, { backgroundColor: canPost ? COLORS.tint : COLORS.tintDisabled }]}
//         >
//           {isPosting ? (
//             <ActivityIndicator size="small" color="white" />
//           ) : (
//             <Text style={styles.postButtonText}>Post</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
//       >
//         <ScrollView
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* 2. USER INFO ROW */}
//           <View style={styles.userRow}>
//             <Image 
//                 source={{ uri: user?.avatar_url || 'https://via.placeholder.com/100' }} 
//                 style={styles.avatar} 
//             />
//             <View>
//               <Text style={{marginBottom: 2, fontWeight: '600', color: COLORS.text, fontSize: 16}}>
//                 {user?.username || 'Username'}
//               </Text>
//               <View style={[styles.pill, { borderColor: COLORS.border }]}>
//                 <Text style={[styles.pillText, { color: COLORS.tint }]}>Public</Text>
//                 <Ionicons name="chevron-down" size={10} color={COLORS.tint} />
//               </View>
//             </View>
//           </View>

//           {/* 3. TITLE INPUT (Large & Bold) */}
//           <TextInput
//             style={[styles.titleInput, { color: COLORS.text }]}
//             placeholder="Post Title"
//             placeholderTextColor={COLORS.muted}
//             value={title}
//             onChangeText={setTitle}
//             maxLength={100}
//             editable={!isPosting}
//             multiline={true}
//             blurOnSubmit={true}
//           />

//           {/* 4. RICH EDITOR (Canvas) */}
//           <View style={styles.editorContainer}>
//             <RichEditor
//               ref={richText}
//               placeholder="What's on your mind?"
//               onChange={setContent}
//               disabled={isPosting}
//               scrollEnabled={false} 
//               initialHeight={150}
//               editorStyle={{
//                 backgroundColor: 'transparent',
//                 color: COLORS.text,
//                 placeholderColor: COLORS.muted,
//                 contentCSSText: `
//                   font-size: 17px; 
//                   line-height: 24px;
//                   min-height: 150px; 
//                   color: ${COLORS.text};
//                   font-family: System;
//                 ` 
//               }}
//               style={{ backgroundColor: 'transparent', flex: 1 }}
//             />
//           </View>

//           {/* 5. ATTACHMENTS & METADATA AREA */}
//           <View style={styles.attachmentsContainer}>
            
//             {/* Image Preview (If selected) */}
//             {selectedImage && (
//               <View style={[styles.imageWrapper, { borderColor: COLORS.border, backgroundColor: COLORS.border }]}>
//                 <Image
//                   source={{ uri: selectedImage }}
//                   style={{
//                     width: '100%',
//                     height: (SCREEN_WIDTH - 32) / imageAspectRatio,
//                     borderRadius: 12,
//                   }}
//                   resizeMode="contain"
//                 />
//                 <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}>
//                   <Ionicons name="close" size={18} color="white" />
//                 </TouchableOpacity>
//               </View>
//             )}

//             {/* Tags Input Section (Bottom) */}
//             <View style={[styles.tagsRow, { borderTopColor: COLORS.border, borderBottomColor: COLORS.border }]}>
//               <View style={styles.tagIconWrapper}>
//                 <Ionicons name="pricetag" size={16} color={COLORS.tint} />
//               </View>
//               <TextInput
//                 style={[styles.tagsInput, { color: COLORS.text }]}
//                 placeholder="Add tags (comma separated)"
//                 placeholderTextColor={COLORS.muted}
//                 value={tags}
//                 onChangeText={setTags}
//                 editable={!isPosting}
//               />
//             </View>
//           </View>

//           {/* Spacer for keyboard */}
//           <View style={{ height: 60 }} />
//         </ScrollView>

//         {/* 6. FLOATING TOOLBAR */}
//         <View style={[styles.toolbarContainer, { backgroundColor: COLORS.background, borderTopColor: COLORS.border }]}>
          
//           {!isPosting && (
//              <View style={styles.mediaButtonsRow}>
//                 {/* Media Picker Button */}
//                 <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
//                    <Ionicons name="image-outline" size={24} color={COLORS.tint} />
//                 </TouchableOpacity>
                
//                 <View style={[styles.verticalDivider, { backgroundColor: COLORS.border }]} />
                
//                 {/* Formatting Toolbar */}
//                 <RichToolbar
//                   editor={richText}
//                   actions={[
//                     actions.setBold,
//                     actions.setItalic,
//                     actions.insertBulletsList,
//                     actions.insertLink,
//                     actions.heading1,
//                   ]}
//                   iconTint={COLORS.text}
//                   selectedIconTint={COLORS.tint}
//                   style={{ backgroundColor: 'transparent', flex: 1 }}
//                   flatContainerStyle={{ paddingHorizontal: 0 }}
//                 />
//              </View>
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   postButton: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   postButtonText: {
//     color: 'white',
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingVertical: 16,
//   },
//   userRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     gap: 12,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#EEEEEE',
//   },
//   pill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     alignSelf: 'flex-start',
//     gap: 4,
//   },
//   pillText: {
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   titleInput: {
//     fontSize: 22,
//     fontWeight: '800', 
//     marginVertical: 8,
//     paddingVertical: 4,
//     includeFontPadding: false,
//     textAlignVertical: 'center',
//   },
//   editorContainer: {
//     minHeight: 150,
//     marginBottom: 10,
//     marginHorizontal: -4, // Negate default padding for seamless look
//   },
//   attachmentsContainer: {
//     gap: 16,
//     marginTop: 10,
//   },
//   imageWrapper: {
//     position: 'relative',
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: StyleSheet.hairlineWidth,
//   },
//   removeImageBtn: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 20,
//     width: 28,
//     height: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   tagsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderBottomWidth: StyleSheet.hairlineWidth,
//   },
//   tagIconWrapper: {
//     marginRight: 12,
//     opacity: 0.8,
//   },
//   tagsInput: {
//     flex: 1,
//     fontSize: 15,
//   },
//   toolbarContainer: {
//     paddingBottom: Platform.OS === 'ios' ? 0 : 0, 
//     borderTopWidth: StyleSheet.hairlineWidth,
//   },
//   mediaButtonsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     height: 50,
//   },
//   mediaButton: {
//     padding: 8,
//     marginRight: 4,
//   },
//   verticalDivider: {
//     width: 1,
//     height: 24,
//     marginHorizontal: 8,
//   },
// });