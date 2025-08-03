// scan.tsx
import React, { useRef, useState, useCallback, useEffect } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Modal, Platform } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [modalVisible, setModalVisible] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
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
    const igneous = ['Granite', 'Basalt', 'Andesite', 'Rhyolite', 'Diorite', 'Gabbro', 'Scoria', 'Tuff'];
    const metamorphic = ['Slate', 'Schist', 'Gneiss', 'Quartzite', 'Marble'];
    const sedimentary = ['Sandstone', 'Limestone', 'Shale', 'Conglomerate', 'Chalk'];

    if (igneous.includes(rockName)) return "Igneous";
    if (metamorphic.includes(rockName)) return "Metamorphic";
    if (sedimentary.includes(rockName)) return "Sedimentary";
    return "Unknown";
  };

  const uploadImageAndScan = async (uri: string) => {
    const formData = new FormData();
    formData.append("image", {
      uri,
      name: "rock.jpg",
      type: "image/jpeg",
    } as any);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        router.push({
          pathname: "/scan-result",
          params: {
            image: result.image_url, // ✅ FIXED: use backend-hosted URL
            rockName: result.rock_type,
            rockType: inferRockCategory(result.rock_type),
          },
        });
      } else {
        alert("Scan failed: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      alert("Upload failed");
      console.error("Upload error:", error);
    }
  };

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    const photoUri = photo?.uri ?? null;
    if (photoUri) uploadImageAndScan(photoUri);
  };

  const openAlbum = async () => {
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
        <Pressable onPress={requestPermission}><Text>Grant Permission</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isScreenFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          ref={cameraRef}
          facing={facing}
          flash={flash}
          mute={false}
        />
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
        <Pressable onPress={openAlbum}>
          <AntDesign name="picture" size={32} color="white" />
        </Pressable>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
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
    position: "absolute", top: 0, left: 0, right: 0, height: 100,
    backgroundColor: "rgba(40, 40, 40, 0.7)", flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  bottomOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0, height: 150,
    backgroundColor: "rgba(40, 40, 40, 0.7)", flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 30, paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  lampIcon: { position: "absolute", bottom: 200, alignSelf: "center" },
  shutterBtn: { borderWidth: 5, borderColor: "white", width: 85, height: 85, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  shutterBtnInner: { width: 70, height: 70, borderRadius: 50, backgroundColor: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: 300, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginVertical: 2 },
  closeBtn: { marginTop: 20, backgroundColor: "#333", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeBtnText: { color: "white", fontSize: 16 }
});
