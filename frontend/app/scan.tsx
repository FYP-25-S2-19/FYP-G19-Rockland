// scan.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [modalVisible, setModalVisible] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [checkingLimit, setCheckingLimit] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  const inferRockCategory = (rockName: string): string => {
    const igneous = ["Granite", "Basalt", "Andesite", "Rhyolite", "Diorite", "Gabbro", "Scoria", "Tuff"];
    const metamorphic = ["Slate", "Schist", "Gneiss", "Quartzite", "Marble"];
    const sedimentary = ["Sandstone", "Limestone", "Shale", "Conglomerate", "Chalk"];

    if (igneous.includes(rockName)) return "Igneous";
    if (metamorphic.includes(rockName)) return "Metamorphic";
    if (sedimentary.includes(rockName)) return "Sedimentary";
    return "Unknown";
  };

  // --- NEW: pre-check daily limit (UX) ---
  const checkScanLimit = async (): Promise<boolean> => {
    try {
      setCheckingLimit(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Login required", "Please log in before scanning.");
        return false;
      }

      const res = await fetch(`${API_URL}/api/scan/check-limit`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      // Expect shape like: { allowed: boolean, remaining: number, limit: 3 }
      if (!res.ok) {
        // Fallback: if this pre-check fails for any reason, don't block the real scan.
        return true;
      }

      if (json && json.allowed === false) {
        Alert.alert("Daily limit reached", "Free users can scan up to 3 times per day.");
        return false;
      }

      return true;
    } catch {
      // If pre-check errors out, allow proceeding; backend still enforces during scan.
      return true;
    } finally {
      setCheckingLimit(false);
    }
  };

  const uploadImageAndScan = async (uri: string) => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "rock.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Login required", "Please log in before scanning.");
        return;
      }

      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        // NOTE: Let RN set boundary automatically; specifying the header is fine,
        // but we must include Authorization for the protected endpoint.
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Handle explicit 403 limit response
      if (response.status === 403) {
        const err = await response.json().catch(() => ({}));
        if (err?.limit_reached) {
          Alert.alert("Daily limit reached", "Free users can scan up to 3 times per day.");
          return;
        }
      }

      const result = await response.json();

      if (response.ok && result?.success) {
        router.push({
          pathname: "/scan-result",
          params: {
            image: result.image_url,
            rockName: result.rock_type,
            rockType: inferRockCategory(result.rock_type),
            rarity: result.rarity,
            rockId: String(result.rock_id ?? ""),
          },
        });
      } else {
        Alert.alert("Scan failed", result?.error || "Unknown error");
      }
    } catch (error) {
      Alert.alert("Upload failed", "Please try again.");
      console.error("Upload error:", error);
    }
  };

  const takePicture = async () => {
    // Optional UX pre-check; backend still enforces during scan.
    const ok = await checkScanLimit();
    if (!ok) return;

    const photo = await cameraRef.current?.takePictureAsync();
    const photoUri = photo?.uri ?? null;
    if (photoUri) uploadImageAndScan(photoUri);
  };

  const openAlbum = async () => {
    // Optional UX pre-check; backend still enforces during scan.
    const ok = await checkScanLimit();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      uploadImageAndScan(result.assets[0].uri);
    }
  };

  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));
  const toggleFlash = () => setFlash((prev) => (prev === "off" ? "on" : "off"));

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>We need permission to use camera</Text>
        <Pressable onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScreenFocused && (
        <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing={facing} flash={flash} mute={false} />
      )}

      <View style={styles.topOverlay}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFlash}>
          <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={32} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.lampIcon} onPress={() => setModalVisible(true)}>
        <Ionicons name="bulb-outline" size={32} color="white" />
      </TouchableOpacity>

      <View style={styles.bottomOverlay}>
        <Pressable onPress={openAlbum} disabled={checkingLimit}>
          <AntDesign name="picture" size={32} color="white" />
        </Pressable>
        <Pressable onPress={takePicture} disabled={checkingLimit}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed || checkingLimit ? 0.5 : 1 }]}>
              <View style={styles.shutterBtnInner} />
            </View>
          )}
        </Pressable>
        <Pressable onPress={toggleFacing}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Camera Tips</Text>
            <Text style={styles.modalText}>• Hold your phone steady</Text>
            <Text style={styles.modalText}>• Ensure proper lighting</Text>
            <Text style={styles.modalText}>• Focus on the object</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(40, 40, 40, 0.7)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "rgba(40, 40, 40, 0.7)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  lampIcon: { position: "absolute", bottom: 200, alignSelf: "center" },
  shutterBtn: {
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: { width: 70, height: 70, borderRadius: 50, backgroundColor: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: 300, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginVertical: 2 },
  closeBtn: { marginTop: 20, backgroundColor: "#333", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeBtnText: { color: "white", fontSize: 16 },
  // Keeping existing styles for container/top/bottom overlays unchanged
});
