import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Image, Modal, Text } from "react-native";
import MapView, { Marker, Camera } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import BackIcon from "../assets/images/back.svg";
import BackpackIcon from "../assets/images/backpack.svg";
import Ionicons from "@expo/vector-icons/Ionicons";

const INITIAL_RADIUS = 300; 
const MAX_MARKERS = 5;
const rockIcon = require("../assets/images/rock.png");

const mapStyle = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "business", stylers: [{ visibility: "off" }] },
];

const generateRarity = () => {
  const rand = Math.random();
  if (rand < 0.1) return "Legendary";
  if (rand < 0.4) return "Rare";
  return "Common";
};

const getLifetime = (rarity: string) => {
  switch (rarity) {
    case "Legendary": return 30;
    case "Rare": return 60;
    default: return 120;
  }
};

export default function RockMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [rockMarkers, setRockMarkers] = useState<any[]>([]);
  const [selectedRock, setSelectedRock] = useState<any | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      generateRandomRocks(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRockMarkers(prev =>
        prev
          .map(marker => ({ ...marker, remaining: marker.remaining - 1 }))
          .filter(marker => marker.remaining > 0)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const generateRandomRocks = (lat: number, lon: number) => {
    const markers = [];
    for (let i = 0; i < MAX_MARKERS; i++) {
      const random = generateRandomOffset(INITIAL_RADIUS);
      const rarity = generateRarity();
      markers.push({
        id: Date.now() + i,
        latitude: lat + random.lat,
        longitude: lon + random.lon,
        name: randomName(),
        type: randomType(),
        rarity,
        remaining: getLifetime(rarity),
      });
    }
    setRockMarkers(markers);
  };

  const generateRandomOffset = (radiusInMeters: number) => {
    const radiusInDegrees = radiusInMeters / 111320;
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    return { lat: w * Math.cos(t), lon: w * Math.sin(t) };
  };

  const randomName = () => {
    const names = ["Granite", "Basalt", "Limestone", "Quartz", "Obsidian"];
    return names[Math.floor(Math.random() * names.length)];
  };

  const randomType = () => {
    const types = ["Igneous", "Sedimentary", "Metamorphic"];
    return types[Math.floor(Math.random() * types.length)];
  };

  const handleRecenter = () => {
    if (!location || !mapRef.current) return;
    mapRef.current.animateCamera({
      center: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      pitch: 60,
      heading: 0,
      zoom: 17,
      altitude: 1000,
    }, { duration: 1000 });
  };

  const handleSaveToCollection = () => {
    if (!selectedRock) return;
    setRockMarkers(prev => prev.filter(marker => marker.id !== selectedRock.id));
    setSelectedRock(null);
  };

  if (!location) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#16A34A" /></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={mapStyle}
        initialCamera={{
          center: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          pitch: 60,
          heading: 0,
          altitude: 1000,
          zoom: 17,
        }}  
        scrollEnabled
        zoomEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {rockMarkers.map(marker => (
          <Marker
            key={marker.id}
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

      <TouchableOpacity onPress={() => router.push("/mycollection")} style={styles.backpackButton} activeOpacity={0.8}>
        <BackpackIcon width={50} height={50} color="#111827" />
      </TouchableOpacity>

      <Modal visible={!!selectedRock} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedRock?.name}</Text>
            <Text>Type: {selectedRock?.type}</Text>
            <Text>Rarity: {selectedRock?.rarity}</Text>
            <Text>Lifetime: {selectedRock?.remaining}s</Text>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#16A34A" }]} onPress={handleSaveToCollection}>
              <Text style={styles.modalButtonText}>Save to Collection</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#111827" }]} onPress={() => setSelectedRock(null)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: 300,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
