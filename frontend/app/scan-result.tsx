import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    console.log("🖼️ Received image URL:", image);
  }, [image]);

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

        const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
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

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/scan/save`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
    <View style={{ flex: 1, backgroundColor: "#fff", paddingTop: 50, alignItems: "center" }}>
      {/* Top Bar */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>Scan Result</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Image Preview */}
      <Image
        source={{ uri: image ?? "https://via.placeholder.com/200" }}
        style={{ width: 200, height: 200, borderRadius: 12 }}
        resizeMode="cover"
      />

      {/* Rarity Badge */}
      <View
        style={{
          marginTop: 20,
          height: 20,
          borderRadius: 999,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: rarity.color,
          width: rarity.width,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
          Rarity: {rarity.label}
        </Text>
      </View>

      {/* Rock Info */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 12, color: "#374151", marginBottom: 5 }}>Rock Name</Text>
        <View style={{ width: 295, height: 46, borderColor: "#D1D5DB", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, justifyContent: "center" }}>
          <Text style={{ fontSize: 14, color: "#111827" }}>{rockName}</Text>
        </View>

        <Text style={{ fontSize: 12, color: "#374151", marginTop: 20, marginBottom: 5 }}>Rock Type</Text>
        <View style={{ width: 295, height: 46, borderColor: "#D1D5DB", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, justifyContent: "center" }}>
          <Text style={{ fontSize: 14, color: "#111827" }}>{rockType}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ marginTop: 30, width: 295 }}>
        <TouchableOpacity
          style={{ backgroundColor: "#16A34A", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginBottom: 16 }}
          activeOpacity={0.8}
          onPress={handleSaveToCollection}
        >
          <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>Save to Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ backgroundColor: "#E5E7EB", paddingVertical: 12, borderRadius: 8, alignItems: "center" }}
          activeOpacity={0.8}
          onPress={() => router.replace("/scan")}
        >
          <Text style={{ color: "#111827", fontSize: 14, fontWeight: "600" }}>Retake Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
