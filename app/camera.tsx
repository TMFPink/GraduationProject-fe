// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";
// import { Ionicons } from "@expo/vector-icons";
// import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
// import { useFocusEffect, useRouter } from "expo-router";
// import { useCallback, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Image,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// // Types for API response
// interface DetectedCard {
//   card_id: string;
//   name: string;
//   rarity: string;
//   image_normal_url: string;
//   image_large_url: string;
//   image_thumb_url: string;
// }

// interface CardDetectionResponse {
//   message: string;
//   statusCode: number;
//   metadata: {
//     card_names: string[];
//     cards: DetectedCard[];
//     total_detected: number;
//     total_found: number;
//   };
// }

// type ViewMode = "camera" | "preview" | "results";

// export default function CameraScreen() {
//   const colorScheme = useColorScheme();
//   const theme = useMemo(
//     () => Colors[colorScheme ?? "light"],
//     [colorScheme]
//   );
//   const router = useRouter();

//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState<CameraType>("back");
//   const [view, setView] = useState<ViewMode>("camera");

//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);

//   const [isDetecting, setIsDetecting] = useState(false);
//   const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);

//   const cameraRef = useRef<CameraView>(null);

//   // Focus lifecycle
// useFocusEffect(
//   useCallback(() => {
//     // onFocus: reset user-facing data only
//     setView("camera");
//     setCapturedImage(null);
//     setDetectedCards([]);
//     setIsDetecting(false);
//     // DO NOT touch isCameraReady here

//     return () => {
//       // onBlur cleanup
//       setCapturedImage(null);
//       setDetectedCards([]);
//       setIsDetecting(false);
//       setView("camera");
//       // It's OK to clear readiness on screen leave
//       setIsCameraReady(false);
//     };
//   }, [])
// );


//   const onCameraReady = () => setIsCameraReady(true);
//   const toggleCameraFacing = () =>
//     setFacing((cur) => (cur === "back" ? "front" : "back"));

//   const detectCards = async (imageUri: string): Promise<CardDetectionResponse | null> => {
//   try {
//     const formData = new FormData();
//     formData.append("file", {
//       uri: imageUri,
//       name: "card_image.jpg",
//       type: "image/jpeg",
//     } as any);
//     formData.append("domain", "ygo");

//     const res = await fetch("http://localhost:3000/v1/card-detection", {
//       method: "POST",
//       body: formData,
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     const data: CardDetectionResponse = await res.json();
//     console.log("✅ Response:", data);
//     return data;
//   } catch (error) {
//     console.error("❌ detectCards error:", error);
//     return null;
//   }
// };

// const takePicture = async () => {
//   if (!cameraRef.current || isCapturing) return;

//   try {
//     setIsCapturing(true);

//     // Some devices keep the preview paused after a shot
//     try {
//       // @ts-ignore – older expo-camera API, harmless if absent
//       await cameraRef.current?.resumePreview?.();
//     } catch {}

//     // If onCameraReady is flaky on device, don't hard-block:
//     // optionally wait a tiny tick if !isCameraReady
//     if (!isCameraReady) {
//       await new Promise((r) => setTimeout(r, 120));
//     }

//     const photo = await cameraRef.current.takePictureAsync({ base64: false });

//     if (photo?.uri) {
//       setCapturedImage(photo.uri);
//       setView("preview");

//       setIsDetecting(true);
//       const result = await detectCards(photo.uri);
//       setIsDetecting(false);

//       if (result && result.statusCode === 200) {
//         setDetectedCards(result.metadata.cards);
//         setView("results");
//       } else {
//         Alert.alert("Detection Failed", "Could not detect cards in the image.");
//         // Stay on preview so user can retake
//       }
//     }
//   } catch (error) {
//     console.error("Error taking picture:", error);
//     Alert.alert("Error", "Failed to take picture. Please try again.");
//   } finally {
//     setIsCapturing(false);
//   }
// };

//   const resetToCamera = () => {
//     setCapturedImage(null);
//     setDetectedCards([]);
//     setIsDetecting(false);
//     setView("camera");
//   };

//   const retakePicture = () => {
//     setCapturedImage(null);
//     setDetectedCards([]);
//     setIsDetecting(false);
//     setView("camera");
//   };

//   // ---- Permission Gates ----
//   if (!permission) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
//         <View style={styles.centerBox}>
//           <Text style={[styles.message, { color: theme.text }]}>
//             Loading camera permissions...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
//         <Header
//           title="Camera Access"
//           left={{ icon: "arrow-back", onPress: () => router.back() }}
//           right={null}
//           color={theme.text}
//         />
//         <View style={styles.centerBox}>
//           <Ionicons name="camera-outline" size={64} color={theme.icon} />
//           <Text style={[styles.message, { color: theme.text }]}>
//             We need your permission to use the camera
//           </Text>
//           <TouchableOpacity
//             style={[styles.primaryBtn, { backgroundColor: theme.tint }]}
//             onPress={requestPermission}
//           >
//             <Text style={styles.primaryBtnText}>Grant Permission</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.ghostBtn, { borderColor: theme.tint }]}
//             onPress={() => router.back()}
//           >
//             <Text style={[styles.ghostBtnText, { color: theme.tint }]}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ---- RESULTS VIEW ----
//   if (view === "results" && detectedCards.length > 0) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
//         <Header
//           title={`Detected Cards (${detectedCards.length})`}
//           left={{ icon: "arrow-back", onPress: () => setView("preview") }}
//           right={{ icon: "close", onPress: () => router.back() }}
//           color={theme.text}
//         />

//         {capturedImage && <MiniPreview uri={capturedImage} />}

//         <FlatList
//           data={detectedCards}
//           keyExtractor={(item) => item.card_id}
//           renderItem={({ item }) => (
//             <CardItem
//               item={item}
//               borderColor={theme.borderColor}
//               textColor={theme.text}
//               secondaryText={theme.secondaryText}
//               tint={theme.tint}
//               background={theme.background}
//             />
//           )}
//           contentContainerStyle={styles.cardsList}
//           showsVerticalScrollIndicator={false}
//         />

//         <View style={styles.bottomActions}>
//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: theme.tint }]}
//             onPress={retakePicture}
//           >
//             <Ionicons name="camera-outline" size={22} color={theme.tint} />
//             <Text style={[styles.actionBtnText, { color: theme.tint }]}>Retake</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, { backgroundColor: theme.tint, borderColor: theme.tint }]}
//             onPress={() => router.back()}
//           >
//             <Ionicons name="checkmark" size={22} color="#fff" />
//             <Text style={[styles.actionBtnText, { color: "#fff" }]}>Done</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ---- PREVIEW VIEW ----
//   if (view === "preview" && capturedImage) {
//     return (
//       <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]}>
//         <Header
//           title="Preview"
//           left={{ icon: "arrow-back", onPress: resetToCamera }}
//           right={{ icon: "close", onPress: () => router.back() }}
//           color="#fff"
//           overlay
//         />

//         <View style={styles.previewContainer}>
//           <Image source={{ uri: capturedImage }} style={styles.previewImage} />

//           {isDetecting ? (
//             <View style={styles.loadingOverlay}>
//               <ActivityIndicator size="large" />
//               <Text style={[styles.loadingText, { color: "#fff", marginTop: 8 }]}>
//                 Detecting cards...
//               </Text>
//             </View>
//           ) : (
//             <TouchableOpacity
//               style={[styles.actionBtn, { backgroundColor: "#fff", borderColor: "#fff", marginTop: 24 }]}
//               onPress={retakePicture}
//             >
//               <Ionicons name="camera-outline" size={22} color="#000" />
//               <Text style={[styles.actionBtnText, { color: "#000" }]}>Retake</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ---- CAMERA VIEW ----
//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: "#000" }]}>
//       <CameraView
//         ref={cameraRef}
//         style={styles.camera}
//         facing={facing}
//         onCameraReady={onCameraReady}
//       >
//         <Header
//           title="Take Photo"
//           left={{ icon: "arrow-back", onPress: () => router.back() }}
//           right={{ icon: "camera-reverse-outline", onPress: toggleCameraFacing }}
//           color="#fff"
//           overlay
//         />

//         <View style={styles.captureContainer}>
//           <TouchableOpacity
//             style={[
//               styles.captureButton,
//               (isCapturing || !isCameraReady) && styles.captureButtonDisabled,
//             ]}
//             onPress={takePicture}
//             disabled={isCapturing || !isCameraReady}
//             activeOpacity={0.8}
//           >
//             <View style={styles.captureDot} />
//           </TouchableOpacity>
//         </View>
//       </CameraView>
//     </SafeAreaView>
//   );
// }

// /* ---------------------------
//  * Small Presentational Pieces
//  * --------------------------*/

// function Header({
//   title,
//   left,
//   right,
//   color = "#fff",
//   overlay = false,
// }: {
//   title: string;
//   left: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void } | null;
//   right: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void } | null;
//   color?: string;
//   overlay?: boolean;
// }) {
//   return (
//     <View
//       style={[
//         styles.header,
//         overlay ? { backgroundColor: "transparent" } : null,
//       ]}
//     >
//       <View style={styles.headerSide}>
//         {left ? (
//           <TouchableOpacity onPress={left.onPress} style={styles.headerBtn}>
//             <Ionicons name={left.icon} size={24} color={color} />
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.headerBtnPlaceholder} />
//         )}
//       </View>

//       <Text style={[styles.headerTitle, { color }]} numberOfLines={1}>
//         {title}
//       </Text>

//       <View style={styles.headerSide}>
//         {right ? (
//           <TouchableOpacity onPress={right.onPress} style={styles.headerBtn}>
//             <Ionicons name={right.icon} size={24} color={color} />
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.headerBtnPlaceholder} />
//         )}
//       </View>
//     </View>
//   );
// }

// function MiniPreview({ uri }: { uri: string }) {
//   return (
//     <View style={styles.miniPreview}>
//       <Image source={{ uri }} style={styles.miniPreviewImage} />
//     </View>
//   );
// }

// function CardItem({
//   item,
//   borderColor,
//   textColor,
//   secondaryText,
//   tint,
//   background,
// }: {
//   item: DetectedCard;
//   borderColor: string;
//   textColor: string;
//   secondaryText: string;
//   tint: string;
//   background: string;
// }) {
//   return (
//     <View style={[styles.cardItem, { backgroundColor: background, borderColor }]}>
//       <Image source={{ uri: item.image_thumb_url }} style={styles.cardImage} />
//       <View style={styles.cardInfo}>
//         <Text style={[styles.cardName, { color: textColor }]} numberOfLines={2}>
//           {item.name}
//         </Text>
//         <Text style={[styles.cardRarity, { color: secondaryText }]}>{item.rarity}</Text>
//       </View>
//       <TouchableOpacity style={styles.cardActionButton}>
//         <Ionicons name="information-circle-outline" size={22} color={tint} />
//       </TouchableOpacity>
//     </View>
//   );
// }

// /* ---------------------------
//  * Styles
//  * --------------------------*/
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#000",
//   },

//   // Header
//   header: {
//     position: "absolute",
//     top: Platform.OS === "ios" ? 50 : 30,
//     left: 0,
//     right: 0,
//     zIndex: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   headerSide: { width: 56, alignItems: "center", justifyContent: "center" },
//   headerBtn: { padding: 8, minWidth: 40, alignItems: "center" },
//   headerBtnPlaceholder: { width: 40, height: 24 },
//   headerTitle: { fontSize: 18, fontWeight: "600" },

//   // Permissions
//   centerBox: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 32,
//   },
//   message: {
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 20,
//     lineHeight: 24,
//   },
//   primaryBtn: {
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 16,
//   },
//   primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   ghostBtn: {
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//   },
//   ghostBtnText: { fontSize: 16, fontWeight: "600" },

//   // Camera
//   camera: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   captureContainer: {
//     position: "absolute",
//     bottom: Platform.OS === "ios" ? 100 : 80,
//     width: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   captureButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   captureButtonDisabled: { backgroundColor: "#CCCCCC" },
//   captureDot: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#FF6B6B",
//   },

//   // Preview
//   previewContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#000",
//   },
//   previewImage: {
//     width: "100%",
//     height: "100%",
//     resizeMode: "contain",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: "rgba(0,0,0,0.55)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: { fontSize: 16, fontWeight: "500" },

//   // Results
//   miniPreview: {
//     height: 100,
//     margin: 16,
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   miniPreviewImage: { width: "100%", height: "100%", resizeMode: "cover" },

//   cardsList: { padding: 16, paddingTop: 0 },
//   cardItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 12,
//     marginBottom: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   cardImage: { width: 60, height: 60, borderRadius: 4, resizeMode: "cover" },
//   cardInfo: { flex: 1, marginLeft: 12 },
//   cardName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
//   cardRarity: { fontSize: 14, opacity: 0.7 },
//   cardActionButton: { padding: 8 },

//   bottomActions: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingHorizontal: 32,
//     paddingVertical: 24,
//     paddingBottom: Platform.OS === "ios" ? 50 : 30,
//   },
// });