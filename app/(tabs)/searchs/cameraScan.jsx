import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { SafeAreaView, TouchableOpacity, View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function CameraScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);

  const colorScheme = useColorScheme();
  const theme = useMemo(() => Colors[colorScheme || "light"], [colorScheme]);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    setIsCapturing(true);
    const photo = await cameraRef.current.takePictureAsync({ base64: false });
    setIsCapturing(false);

    if (photo?.uri) {
      router.navigate({
        pathname: "/(tabs)/searchs/cameraPreview",
        params: { uri: photo.uri },
      });
    }
  };

  if (!permission) return null;
  if (!permission.granted)
    return (
      <SafeAreaView>
        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Camera Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        onCameraReady={() => setIsCameraReady(true)}
      >
        {/* Back button */}
        <View style={{ position: "absolute", top: 40, left: 20 }}>
          <TouchableOpacity onPress={() => router.navigate("/(tabs)/searchs")}>
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Switch camera */}
        <View style={{ position: "absolute", top: 40, right: 20 }}>
          <TouchableOpacity
            onPress={() =>
              setFacing((prev) => (prev === "back" ? "front" : "back"))
            }
          >
            <Ionicons name="camera-reverse-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* Capture button */}
        <View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 80 : 50,
            width: "100%",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={takePicture}
            disabled={!isCameraReady || isCapturing}
            style={{
              width: 80,
              height: 80,
              backgroundColor: isCapturing ? "#777" : "white",
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "red",
                borderRadius: 30,
              }}
            />
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
