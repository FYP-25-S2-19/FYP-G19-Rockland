import React, { useEffect, useRef } from "react";
import { SafeAreaView, TouchableOpacity, View, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackIcon from "../../assets/images/back.svg";

export default function FullMapScreen() {
  const { lat, lng, name } = useLocalSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // Safely parse params
  const latitude = lat ? parseFloat(String(lat)) : NaN;
  const longitude = lng ? parseFloat(String(lng)) : NaN;

  if (isNaN(latitude) || isNaN(longitude)) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600 text-lg mb-4">
          Invalid or missing location data
        </Text>
        <TouchableOpacity
          className="px-6 py-3 bg-[#459B6C] rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Animate camera to zoom 17
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: { latitude, longitude },
          zoom: 17,
        },
        { duration: 800 }
      );
    }
  }, [latitude, longitude]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">
          {name ? String(name) : "Rock Location"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Full-Screen Map */}
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={name ? String(name) : "Rock"}
        />
      </MapView>
    </SafeAreaView>
  );
}
