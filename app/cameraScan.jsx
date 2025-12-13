import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DESIRED_RATIO = 3 / 4; // 3:4 aspect ratio

export default function CameraScanScreen() {
  const params = useLocalSearchParams();
  const domain = params.domain || 'ygo';
  const colorScheme = useColorScheme();
  const theme = useMemo(() => Colors[colorScheme ?? "light"], [colorScheme]);
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const cameraRef = useRef(null);

  // Calculate camera view dimensions for 3:4 ratio
  const cameraViewDimensions = useMemo(() => {
    // Use screen width as base
    const viewWidth = SCREEN_WIDTH;
    const viewHeight = viewWidth / DESIRED_RATIO; // For 3:4, height = width / (3/4) = width * 4/3
    
    return {
      width: viewWidth,
      height: viewHeight,
    };
  }, []);

  // Focus lifecycle - reset camera when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      // Reset states when screen comes into focus
      setIsCameraReady(false);
      setIsCapturing(false);
      
      // Small delay to ensure camera is ready
      const timer = setTimeout(() => {
        setIsCameraReady(false);
      }, 100);

      return () => {
        // Cleanup when leaving screen
        clearTimeout(timer);
        setIsCameraReady(false);
        setIsCapturing(false);
      };
    }, [])
  );

  const onCameraReady = () => setIsCameraReady(true);
  
  const toggleCameraFacing = () =>
    setFacing((cur) => (cur === "back" ? "front" : "back"));

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing || !isCameraReady) return;

    try {
      setIsCapturing(true);

      // Resume preview if paused (some devices)
      try {
        await cameraRef.current?.resumePreview?.();
      } catch {}

      // Take picture with 3:4 aspect ratio
      const photo = await cameraRef.current.takePictureAsync({ 
        base64: false,
        quality: 1,
        // Note: expo-camera doesn't have a direct aspectRatio option
        // The ratio is controlled by the CameraView dimensions
      });

      if (photo?.uri) {
        console.log("Photo captured:", photo.uri);
        
        // Reset states before navigation
        setIsCapturing(false);
        setIsCameraReady(false);
        
        // Navigate to preview screen with the captured image
        router.push({
          pathname: "/cameraPreview",
          params: { imageUri: photo.uri, domain: domain },
        });
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
      setIsCapturing(false);
    }
  };

  // ---- Permission Gates ----
  if (!permission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerBox}>
          <Text style={[styles.message, { color: theme.text }]}>
            Loading camera permissions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Header
          title="Camera Access"
          left={{ icon: "arrow-back", onPress: () => router.back() }}
          right={null}
          color={theme.text}
        />
        <View style={styles.centerBox}>
          <Ionicons name="camera-outline" size={64} color={theme.icon} />
          <Text style={[styles.message, { color: theme.text }]}>
            We need your permission to use the camera
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.tint }]}
            onPress={requestPermission}
          >
            <Text style={styles.primaryBtnText}>Grant Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostBtn, { borderColor: theme.tint }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.ghostBtnText, { color: theme.tint }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- CAMERA VIEW ----
  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Take Photo"
          left={{ icon: "arrow-back", onPress: () => router.back() }}
          right={{ icon: "camera-reverse-outline", onPress: toggleCameraFacing }}
          color="#fff"
        />
      </SafeAreaView>

      {/* Camera container centered on screen */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={[
            styles.camera,
            {
              width: cameraViewDimensions.width,
              height: cameraViewDimensions.height,
            }
          ]}
          facing={facing}
          onCameraReady={onCameraReady}
        />
      </View>

      {/* Capture button at bottom */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          style={[
            styles.captureButton,
            (isCapturing || !isCameraReady) && styles.captureButtonDisabled,
          ]}
          onPress={takePicture}
          disabled={isCapturing || !isCameraReady}
          activeOpacity={0.8}
        >
          <View style={styles.captureDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Header({ title, left, right, color = "#fff" }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {left ? (
          <TouchableOpacity onPress={left.onPress} style={styles.headerBtn}>
            <Ionicons name={left.icon} size={24} color={color} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnPlaceholder} />
        )}
      </View>

      <Text style={[styles.headerTitle, { color }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.headerSide}>
        {right ? (
          <TouchableOpacity onPress={right.onPress} style={styles.headerBtn}>
            <Ionicons name={right.icon} size={24} color={color} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBtnPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: { width: 56, alignItems: "center", justifyContent: "center" },
  headerBtn: { padding: 8, minWidth: 40, alignItems: "center" },
  headerBtnPlaceholder: { width: 40, height: 24 },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
    lineHeight: 24,
  },
  primaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  ghostBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  ghostBtnText: { fontSize: 16, fontWeight: "600" },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  camera: {
    // Dimensions are set dynamically via inline style
  },
  captureContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 100 : 80,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  captureButtonDisabled: { backgroundColor: "#CCCCCC" },
  captureDot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B6B",
  },
});