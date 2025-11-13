import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Button,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';

export default function RichTextEditorPage() {
  const richText = useRef();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const animatedToolbarY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(animatedToolbarY, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      Animated.timing(animatedToolbarY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 📸 Pick + upload image, then insert into editor
  const handleInsertImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;

      setLoading(true);
      const imageUrl = await uploadImage(uri);
      setLoading(false);

      richText.current?.insertImage(imageUrl);
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('Upload failed', 'Could not insert image');
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name: 'upload.jpg',
      type: 'image/jpeg',
    });

    const response = await fetch('https://your-api.com/upload-temp', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData,
    });

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    const html = await richText.current.getContentHtml();
    console.log('Submitting HTML:', html);

    await fetch('https://your-api.com/save-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'My Post Title',
        content: html,
      }),
    });

    Alert.alert('✅ Saved!', 'Your post has been submitted.');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>📝 Create New Post</Text>

        {loading && <ActivityIndicator size="large" color="#007aff" style={{ marginVertical: 10 }} />}

        <RichToolbar
            editor={richText}
            actions={[
              actions.insertImage,
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
              actions.undo,
              actions.redo,
            ]}
            iconTint="#333"
            style={styles.toolbar}
            onPressAddImage={handleInsertImage}
          />

          {/* Close Keyboard Button */}
          <TouchableOpacity style={styles.closeKeyboardButton} onPress={() => Keyboard.dismiss()}>
            <Text style={{ color: '#007aff', fontWeight: '600' }}>Done</Text>
          </TouchableOpacity>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <RichEditor
            ref={richText}
            placeholder="Write something beautiful..."
            onChange={setContent}
            editorStyle={{ backgroundColor: '#fff', contentCSSText: 'font-size: 16px; min-height: 300px;' }}
            style={styles.richEditor}
          />
        </KeyboardAwareScrollView>

        {/* Toolbar floating above keyboard */}



        <Button title="Publish Post" onPress={handleSubmit} color="#007aff" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
  },
  richEditor: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 300,
    marginBottom: 10,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f1f1f1',
    paddingBottom: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  toolbar: {
    backgroundColor: '#eee',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  closeKeyboardButton: {
    alignSelf: 'flex-end',
    padding: 6,
    marginBottom: 5,
    marginRight: 10,
  },
});
