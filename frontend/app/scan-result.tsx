import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useState } from "react";

const getRandomRarity = () => {
  const rarities = [
    { label: "Common", color: "#9CA3AF", width: 100 },
    { label: "Rare", color: "#16A34A", width: 100 },
    { label: "Legendary", color: "#EF9E1C", width: 120 },
  ];
  const randomIndex = Math.floor(Math.random() * rarities.length);
  return rarities[randomIndex];
};

export default function ScanResult() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const image = typeof params.image === "string" ? params.image : undefined;
  const rockName = typeof params.rockName === "string" ? params.rockName : "Unknown";
  const rockType = typeof params.rockType === "string" ? params.rockType : "Unknown";
  const [rarity] = useState(getRandomRarity());

  const handleSaveToCollection = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) throw new Error("User not authenticated");

      let latitude = null;
      let longitude = null;
      let location_name = null;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        latitude = location.coords.latitude;
        longitude = location.coords.longitude;

        const geocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        location_name = geocode?.[0]?.name || null;
      }

      const payload = {
        rock_name: rockName,
        rock_type: rockType,
        rarity: rarity.label,
        image_url: image,
        latitude,
        longitude,
        location_name,
      };

      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/scan/save`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        alert("✅ Saved to collection!");
      } else {
        alert("❌ Failed to save: " + res.data.message);
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("❌ Save failed");
    }
  };

  return (
    <View className="flex-1 bg-white pt-[50px] items-center">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between w-full px-5 mb-10">
        <TouchableOpacity onPress={() => router.back()} className="p-1.5">
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[18px] font-bold text-[#111827]">Scan Result</Text>
        <View className="w-6" />
      </View>

      {/* Image */}
      <Image
        source={{ uri: image ?? "https://via.placeholder.com/200" }}
        style={{ width: 200, height: 200, borderRadius: 12 }}
        contentFit="cover"
      />

      {/* Rarity */}
      <View
        className="mt-5 h-5 rounded-full justify-center items-center"
        style={{ backgroundColor: rarity.color, width: rarity.width }}
      >
        <Text className="text-white text-[12px] font-semibold">Rarity: {rarity.label}</Text>
      </View>

      {/* Result Fields */}
      <View className="mt-8">
        <Text className="text-[12px] text-[#374151] mb-1.5">Rock Name</Text>
        <View className="w-[295px] h-[46px] border border-[#D1D5DB] rounded-lg px-3 flex-row items-center">
          <Text className="text-[14px] text-[#111827]">{rockName}</Text>
        </View>

        <Text className="text-[12px] text-[#374151] mt-4 mb-1.5">Rock Type</Text>
        <View className="w-[295px] h-[46px] border border-[#D1D5DB] rounded-lg px-3 flex-row items-center">
          <Text className="text-[14px] text-[#111827]">{rockType}</Text>
        </View>
      </View>

      <View className="mt-8 w-[295px] space-y-4">
        <TouchableOpacity
          className="bg-green-600 py-3 rounded-lg items-center mb-4"
          activeOpacity={0.8}
          onPress={handleSaveToCollection}
        >
          <Text className="text-white font-semibold text-[14px]">Save to Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-200 py-3 rounded-lg items-center"
          activeOpacity={0.8}
          onPress={() => router.replace("/scan")}
        >
          <Text className="text-[#111827] font-semibold text-[14px]">Retake Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
