import { useRef, useState, useCallback } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Modal, Platform } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [modalVisible, setModalVisible] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>We need permission to use camera</Text>
        <Pressable onPress={requestPermission}><Text>Grant Permission</Text></Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    const photoUri = photo?.uri ?? null;
    if (photoUri) {
      router.push({ pathname: "/scan-result", params: { image: photoUri } });
    }
  };

  const openAlbum = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      router.push({ pathname: "/scan-result", params: { image: pickedUri } });
    }
  };

  const toggleFacing = () => setFacing((prev) => (prev === "back" ? "front" : "back"));
  const toggleFlash = () => setFlash((prev) => (prev === "off" ? "on" : "off"));

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

      {/* Top Controls */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleFlash}>
          <Ionicons name={flash === "off" ? "flash-off" : "flash"} size={32} color="white" />
        </TouchableOpacity>
      </View>

      {/* Lamp Icon */}
      <TouchableOpacity style={styles.lampIcon} onPress={() => setModalVisible(true)}>
        <Ionicons name="bulb-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Shutter Controls */}
      <View style={styles.shutterContainer}>
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

      {/* Modal */}
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
  topBar: { position: "absolute", top: 50, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" },
  lampIcon: { position: "absolute", bottom: 160, alignSelf: "center" },
  shutterContainer: {
    position: "absolute", bottom: Platform.OS === "android" ? 60 : 44, // extra padding for Android buttons
    left: 0, width: "100%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 30, alignItems: "center"
  },
  shutterBtn: { borderWidth: 5, borderColor: "white", width: 85, height: 85, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  shutterBtnInner: { width: 70, height: 70, borderRadius: 50, backgroundColor: "white" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: 300, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 16, marginVertical: 2 },
  closeBtn: { marginTop: 20, backgroundColor: "#333", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeBtnText: { color: "white", fontSize: 16 }
});
