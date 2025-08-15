import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
  Linking,
  Image,
} from "react-native";
import MapView, { Camera, Marker, Region, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BackIcon from "../assets/images/back.svg";
import BackpackIcon from "../assets/images/backpack.svg";
import RockMarkerModal from "../components/RockMarkerModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";

const rockIcon = require("../assets/images/marker.png");

// (used in #6)
const COLLECT_RADIUS = 150;

const VIEW_RADIUS = 1000;
const REFRESH_DISTANCE = 50;
const REFRESH_INTERVAL = 300000;

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
  const [apiCount, setApiCount] = useState<number>(0);
  const [currentZone, setCurrentZone] = useState<string | null>(null);
  const [currentZoneGeo, setCurrentZoneGeo] = useState<string | null>(null);
  const [selectedRock, setSelectedRock] = useState<RockSpawn | null>(null);
  const [animatedRadius, setAnimatedRadius] = useState(50);
  const auraRadius = useRef(new Animated.Value(50)).current;
  const [currentMarkerIcon, setCurrentMarkerIcon] = useState(rockIcon);
  const [lastFetchLocation, setLastFetchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [noNearbyMessage, setNoNearbyMessage] = useState<string | null>(null);
  const [locDenied, setLocDenied] = useState<boolean>(false);

  const lastZoneRef = useRef<string | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const fetchAbort = useRef<AbortController | null>(null);    
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Haversine formula
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch rock markers  (#4 AbortController)
  const fetchMarkers = async (lat: number, lng: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      // cancel previous in-flight
      fetchAbort.current?.abort();
      const ctrl = new AbortController();
      fetchAbort.current = ctrl;

      console.log(`📍 Fetching spawns at lat:${lat}, lng:${lng}, radius:${VIEW_RADIUS}`);

      const response = await fetch(
        `${API_URL}/api/spawns/nearby?lat=${lat}&lng=${lng}&radius=${VIEW_RADIUS}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: ctrl.signal }
      );

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => router.push("/login") },
          ]);
        }
        setRockMarkers([]);
        setApiCount(0);
        setNoNearbyMessage("No rocks nearby within 1000m.");
        return;
      }

      const data = await response.json();
      const apiSpawns = Array.isArray(data.spawns) ? data.spawns : [];
      setApiCount(apiSpawns.length);

      console.log("🔍 API returned spawns:", apiSpawns.length);
      if (apiSpawns.length > 0) {
        console.log("Example spawn:", apiSpawns.slice(0, 3));
      }

      // Zone toast (anti-spam)
      if (data.zone?.zone_name && data.zone.zone_name !== lastZoneRef.current) {
        Toast.show({
          type: "info",
          text1: `Welcome to ${data.zone.zone_name}`,
          text2: data.zone?.geological_name || undefined,
          position: "top",
          visibilityTime: 3000,
        });
        lastZoneRef.current = data.zone.zone_name;
      }
      setCurrentZone(data.zone?.zone_name || null);
      setCurrentZoneGeo(data.zone?.geological_name || null);

      if (data.success && Array.isArray(apiSpawns)) {
        const formatted = apiSpawns.map((s: RockSpawn) => ({
          ...s,
          latitude: parseFloat(String(s.latitude)),
          longitude: parseFloat(String(s.longitude)),
        }));
        setRockMarkers(formatted);
        setNoNearbyMessage(formatted.length === 0 ? "No rocks nearby within 1000m." : null);
      } else {
        setRockMarkers([]);
        setNoNearbyMessage("No rocks nearby within 1000m.");
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return; // ignore aborted fetch
      console.error("❌ Failed to fetch spawns:", error);
      setRockMarkers([]);
      setApiCount(0);
      setNoNearbyMessage("No rocks nearby within 1000m.");
    }
  };

  // Auto-expire markers
  useEffect(() => {
    const interval = setInterval(() => {
      setRockMarkers((prev) =>
        prev.filter((marker) => {
          const expireMs = new Date(marker.expires_at).getTime() - Date.now();
          return expireMs > -1000; // 1-second grace
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to collection  (#3 optimistic remove)
  const handleSaveToCollection = async (spawn: RockSpawn) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload = {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      };

      const res = await fetch(`${API_URL}/api/spawns/collect/${spawn.rock_spawn_id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // optimistic remove + haptics + toast
        setRockMarkers(prev => prev.filter(m => m.rock_spawn_id !== spawn.rock_spawn_id));
        setSelectedRock(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Toast.show({ type: "success", text1: data.message });
        // backfill with a fresh fetch to sync any side-effects
        fetchMarkers(location!.coords.latitude, location!.coords.longitude);
        return;
      }

      if (res.status === 409 || data.message?.toLowerCase().includes("already")) {
        Toast.show({
          type: "info",
          text1: "Duplicate rock detected",
          text2: "This rock is already in your collection.",
        });
        setSelectedRock(null);
        // remove if server says it's already collected (it should disappear)
        setRockMarkers(prev => prev.filter(m => m.rock_spawn_id !== spawn.rock_spawn_id));
        fetchMarkers(location!.coords.latitude, location!.coords.longitude);
        return;
      }

      Toast.show({
        type: "error",
        text1: "Collect failed",
        text2: data.message || "Unable to collect rock",
      });
    } catch (err) {
      Toast.show({ type: "error", text1: "Network Error", text2: "Please try again later" });
      console.error("Error collecting rock:", err);
    }
  };

  // Location watch + initial fetch  (#5 permission-denied UI)
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocDenied(true);
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 20,
        },
        (loc) => {
          setLocation(loc);

          if (!lastFetchLocation) {
            fetchMarkers(loc.coords.latitude, loc.coords.longitude);
            setLastFetchLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          } else {
            const distance = getDistance(
              lastFetchLocation.lat,
              lastFetchLocation.lng,
              loc.coords.latitude,
              loc.coords.longitude
            );
            if (distance >= REFRESH_DISTANCE) {
              fetchMarkers(loc.coords.latitude, loc.coords.longitude);
              setLastFetchLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
          }
        }
      );
    })();

    return () => subscription?.remove();
  }, []);

  // 5-min interval refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (location) {
        fetchMarkers(location.coords.latitude, location.coords.longitude);
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [location]);

  // Aura pulse animation (unchanged)
  useEffect(() => {
    const id = auraRadius.addListener(({ value }) => {
      setAnimatedRadius(value);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(auraRadius, {
          toValue: 150,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(auraRadius, {
          toValue: 70,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    return () => {
      auraRadius.removeListener(id);
    };
  }, []);

  // Zoom-based marker scaling
  const handleRegionChange = (region: Region) => {
    const zoomLevel = Math.round(Math.log2(360 / region.longitudeDelta));
    if (zoomLevel < 13) {
      setCurrentMarkerIcon(require("../assets/images/marker_small.png"));
    } else if (zoomLevel < 16) {
      setCurrentMarkerIcon(require("../assets/images/marker_medium.png"));
    } else {
      setCurrentMarkerIcon(require("../assets/images/marker.png"));
    }
  };

  const handleRecenter = () => {
    if (!location || !mapRef.current) return;
    const camera: Camera = {
      center: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      pitch: 45,
      heading: 0,
      zoom: 17,
      altitude: 0,
    };
    mapRef.current.animateCamera(camera, { duration: 1000 });
  };

  // (#5) Permission denied UI
  if (locDenied) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-white">
        <Text className="text-lg font-semibold mb-2">Location required</Text>
        <Text className="text-gray-600 text-center">
          Enable location to see nearby rocks and collect them.
        </Text>
        <TouchableOpacity
          className="mt-4 bg-gray-900 px-4 py-3 rounded-xl"
          onPress={() => Linking.openSettings()}
        >
          <Text className="text-white font-semibold">Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  const initialCamera: Camera = {
    center: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    },
    pitch: 45,
    heading: 0,
    zoom: 17,
    altitude: 0,
  };

  // (#6) distance + canCollect
  const distanceToSelected =
    selectedRock
      ? getDistance(
          location.coords.latitude,
          location.coords.longitude,
          selectedRock.latitude,
          selectedRock.longitude
        )
      : null;

  const canCollect =
    distanceToSelected !== null && distanceToSelected <= COLLECT_RADIUS;

  return (
    <View className="flex-1">
      {currentZone && (
        <View
          style={{
            position: "absolute",
            top: 50,
            alignSelf: "center",
            backgroundColor: "white",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            zIndex: 50,
            alignItems: "center",
            maxWidth: "90%",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1f2937" }}>
            {currentZone}
          </Text>

          {currentZoneGeo && (
            <Text
              style={{
                marginTop: 2,
                fontSize: 12,
                color: "#6b7280",
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              Formation: {currentZoneGeo}
            </Text>
          )}

          {noNearbyMessage && (
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4, textAlign: "center" }}>
              {noNearbyMessage}
            </Text>
          )}
        </View>
      )}


      <MapView
        provider={PROVIDER_GOOGLE}
        ref={mapRef}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
        initialCamera={initialCamera}
        pitchEnabled
        zoomEnabled
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={[
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "administrative", elementType: "labels", stylers: [{ visibility: "simplified" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#aadaff" }] },
          { featureType: "poi.park", elementType: "labels", stylers: [{ visibility: "on" }] },
        ]}
      >
        <Circle
          center={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          radius={animatedRadius}
          strokeWidth={2}
          strokeColor="rgba(22, 163, 74, 0.5)"
          fillColor="rgba(22, 163, 74, 0.2)"
          zIndex={1}
        />

       {rockMarkers.map((m) => (
          <Marker
            key={m.rock_spawn_id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            onPress={() => setSelectedRock(m)}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}   // perf
            image={currentMarkerIcon}
          />
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
        className="absolute bottom-20 right-5 bg-white rounded-full p-2 shadow-md"
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
        onExpire={() => fetchMarkers(location.coords.latitude, location.coords.longitude)}
        // (#6) new props for better UX
        canCollect={canCollect}
        distanceMeters={distanceToSelected ?? undefined}
      />
    </View>
  );
}