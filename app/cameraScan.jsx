import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
  Platform,
  StyleSheet,
  Button
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  
  // 1. Setup State and Permissions exactly like Expo Doc
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  
  // State for capturing logic
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // 2. Permission Handling Views (Crucial for Android)
  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // 3. Logic Functions
  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: false,
        quality: 1, // Optional: 0.0 - 1.0
      });

      if (photo?.uri) {
        router.navigate({
          pathname: "/cameraPreview",
          params: { uri: photo.uri },
        });
      }
    } catch (e) {
      console.error("Failed to take picture:", e);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Structure: 
         1. CameraView is the background
         2. UI Controls are overlayed on top using absolute positioning
      */}
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />

      {/* --- UI OVERLAYS --- */}
      
      {/* Back Button */}
      <View style={styles.topButtonContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>

        {/* Flip Camera Button */}
        <TouchableOpacity onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {/* Capture Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={takePicture}
          disabled={!isCameraReady || isCapturing}
          style={[
            styles.captureBtnOuter,
            { backgroundColor: isCapturing ? "#777" : "white" },
          ]}
        >
          <View style={styles.captureBtnInner} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
    width: '100%', 
  },
  // Overlay Styles
  topButtonContainer: {
    position: 'absolute',
    top: 50, // Adjust for Safe Area
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === "ios" ? 50 : 30,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },
  captureBtnOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtnInner: {
    width: 60,
    height: 60,
    backgroundColor: "red",
    borderRadius: 30,
  },
});