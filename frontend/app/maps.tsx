import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BackIcon from "../assets/images/back.svg";
import BackpackIcon from "../assets/images/backpack.svg";
import RockMarkerModal from "../components/RockMarkerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

const rockIcon = require("../assets/images/rock.png");

interface RockSpawn {
  rock_spawn_id: number;
  latitude: number;
  longitude: number;
  location_name: string;
  expires_at: string;
  rock: {
    rock_id: number;
    rock_name: string;
    rock_type: string;
    rarity?: string;
    description: string;
    signed_url?: string;
    photo_url?: string;
  };
}

export default function RockMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [rockMarkers, setRockMarkers] = useState<RockSpawn[]>([]);
  const [selectedRock, setSelectedRock] = useState<RockSpawn | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchMarkers = async (lat: number, lng: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/spawns/nearby?lat=${lat}&lng=${lng}&radius=10000`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => router.push("/login") },
          ]);
        }
        return;
      }

      const data = await response.json();

     if (data.success && Array.isArray(data.spawns)) {
      console.log("📦 Raw Spawns:", JSON.stringify(data.spawns, null, 2));
      const bufferMs = 2 * 60 * 1000;
      const now = new Date(Date.now() - bufferMs);
      console.log("🕒 Adjusted Client Time (with buffer):", now.toISOString());

      data.spawns.forEach((s: RockSpawn, index: number) => {
        console.log(`⏳ Spawn[${index}] expires_at:`, s.expires_at, "Parsed:", new Date(s.expires_at).toISOString());
      });

      // 🔥 REMOVE FILTER FOR DEBUGGING
      const filtered = data.spawns.map((s: RockSpawn) => ({
        ...s,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
      }));

      console.log("🪨 Showing Markers (no filter):", filtered.length);
      setRockMarkers(filtered);
      } else {
        console.warn("🛑 Unexpected response or spawns missing:", data);
        setRockMarkers([]);
      }
    } catch (error) {
      console.error("Failed to fetch spawns", error);
    }
  };

  const handleSaveToCollection = async (spawn: RockSpawn) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");

      const payload = {
        rock_id: spawn.rock.rock_id,
        source: "discovered",
        latitude: spawn.latitude,
        longitude: spawn.longitude,
        location_name: spawn.location_name || "Unknown",
      };

      const res = await fetch(`${API_URL}/api/collection/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: data.message });
        setSelectedRock(null);
        fetchMarkers(location!.coords.latitude, location!.coords.longitude);
      } else {
        Toast.show({ type: "error", text1: "Save failed", text2: data.message });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Network Error", text2: "Please try again later" });
      console.error("Error saving to collection:", err);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Permission Required", "Please enable location access.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchMarkers(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const handleRecenter = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      1000
    );
  };

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {rockMarkers.map((marker) => (
          <Marker
            key={marker.rock_spawn_id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => setSelectedRock(marker)}
          >
            <Image source={rockIcon} style={{ width: 40, height: 40 }} />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-[50px] left-5 bg-white rounded-full p-2 shadow-md"
      >
        <BackIcon width={24} height={24} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleRecenter}
        className="absolute bottom-10 right-5 bg-white rounded-full p-2 shadow-md"
      >
        <Ionicons name="locate" size={30} color="#111827" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/mycollection")}
        className="absolute bottom-10 self-center w-[70px] h-[70px] rounded-full bg-white justify-center items-center shadow-md"
      >
        <BackpackIcon width={50} height={50} color="#111827" />
      </TouchableOpacity>

      <RockMarkerModal
        visible={!!selectedRock}
        rock={selectedRock}
        onClose={() => setSelectedRock(null)}
        onSave={handleSaveToCollection}
      />
    </View>
  );
}
