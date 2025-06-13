import { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { Camera, CameraType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { View, Text, TouchableOpacity, Image, SafeAreaView, Modal } from "react-native";

export default function ScanCamera() {
  const router = useRouter();
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [tutorialVisible, setTutorialVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      router.push({ pathname: "/scan-result", params: { image: photo.uri } });
    }
  };

  const handleOpenGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled) {
      router.push({ pathname: "/scan-result", params: { image: result.assets[0].uri } });
    }
  };

  if (hasPermission === null) {
    return <View className="flex-1 items-center justify-center"><Text>Requesting permission...</Text></View>;
  }

  if (hasPermission === false) {
    return <View className="flex-1 items-center justify-center"><Text>No access to camera</Text></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Camera ref={cameraRef} className="flex-1" type={CameraType.back} />

      {/* Bottom Controls */}
      <View className="absolute bottom-8 w-full flex-row justify-around items-center px-8">
        {/* Gallery */}
        <TouchableOpacity onPress={handleOpenGallery} className="items-center">
          <Text className="text-3xl">🖼️</Text>
        </TouchableOpacity>

        {/* Capture */}
        <TouchableOpacity onPress={handleCapture} className="items-center justify-center w-20 h-20 rounded-full border-4 border-white bg-transparent">
          <View className="w-14 h-14 bg-white rounded-full" />
        </TouchableOpacity>

        {/* Tutorial */}
        <TouchableOpacity onPress={() => setTutorialVisible(true)} className="items-center">
          <Text className="text-3xl">💡</Text>
        </TouchableOpacity>
      </View>

      {/* Tutorial Modal */}
      <Modal visible={tutorialVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-xl p-6 w-3/4">
            <Text className="text-lg font-semibold mb-4">Scan Tutorial</Text>
            <Text className="mb-4">Place the rock in the center of the frame and capture. Make sure lighting is good.</Text>
            <TouchableOpacity onPress={() => setTutorialVisible(false)} className="mt-2 bg-green-600 py-3 rounded-lg">
              <Text className="text-white font-semibold text-center">Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
