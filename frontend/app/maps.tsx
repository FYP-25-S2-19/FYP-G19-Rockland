// RockMapScreen.tsx

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to use this feature.");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchMarkers(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchMarkers = async (lat: number, lng: number) => {
    try {
      const radius = 10000;
      const token = await AsyncStorage.getItem("accessToken");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/api/spawns/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      if (data.success) {
        setRockMarkers(data.spawns);
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
  
        // ✅ Remove the saved spawn from rockMarkers
        setRockMarkers(prev => prev.filter(marker => marker.rock_spawn_id !== spawn.rock_spawn_id));
  
        setSelectedRock(null);
      } else {
        Toast.show({ type: "error", text1: "Save failed", text2: data.message });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Network Error", text2: "Please try again later" });
      console.error("Error saving to collection:", err);
    }
  };

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
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        scrollEnabled
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false}
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

      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <BackIcon width={24} height={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRecenter} style={styles.recenterButton}>
        <Ionicons name="locate" size={30} color="#111827" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/mycollection")}
        style={styles.backpackButton}
        activeOpacity={0.8}
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: Dimensions.get("window").width, height: Dimensions.get("window").height },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  recenterButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backpackButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
