import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE, Polygon, Marker, LatLng, Region } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BackIcon from "../../assets/images/back.svg";

// -------- Types --------
type GeoJSONPolygon = {
  type: "Polygon";
  // GeoJSON uses [lng, lat]
  coordinates: number[][][]; // [ outer[ [lng,lat], ... ], hole1[...], ... ]
};

type GeoJSONMultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][]; // [ polygon1[ rings[] ], polygon2[ rings[] ] ]
};

type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

type Zone = {
  zone_id: number;
  zone_name: string;
  geological_name: string;
  rock_type: string;
  key_rock: string;
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
  polygon_geojson?: GeoJSONGeometry | any | null;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Convert a GeoJSON linear ring (array of [lng,lat]) to RN Maps LatLng[]
const ringToLatLng = (ring: number[][]): LatLng[] => ring.map(([lng, lat]) => ({ latitude: lat, longitude: lng }));

// Normalize any GeoJSON-ish value into a bare Polygon/MultiPolygon (or null)
const normalizeGeometry = (g: any): GeoJSONGeometry | null => {
  if (!g || typeof g !== "object") return null;
  if (g.type === "Polygon" || g.type === "MultiPolygon") return g as GeoJSONGeometry;
  if (g.type === "Feature") {
    const geom = g.geometry;
    return geom && (geom.type === "Polygon" || geom.type === "MultiPolygon") ? geom : null;
  }
  if (g.type === "FeatureCollection" && Array.isArray(g.features)) {
    for (const f of g.features) {
      const geom = f?.geometry;
      if (geom && (geom.type === "Polygon" || geom.type === "MultiPolygon")) return geom;
    }
    return null;
  }
  if (g.type === "GeometryCollection" && Array.isArray(g.geometries)) {
    for (const geom of g.geometries) {
      if (geom && (geom.type === "Polygon" || geom.type === "MultiPolygon")) return geom;
    }
    return null;
  }
  return null;
};

// Break a GeoJSON geometry into polygon parts for react-native-maps
const geojsonToParts = (raw?: GeoJSONGeometry | any | null): { outer: LatLng[]; holes: LatLng[][] }[] => {
  const g = normalizeGeometry(raw);
  if (!g) return [];
  if (g.type === "Polygon") {
    const coords = g.coordinates;
    if (!Array.isArray(coords) || !Array.isArray(coords[0])) return [];
    const [outer, ...holes] = coords as number[][][];
    return [{ outer: ringToLatLng(outer), holes: holes.map(ringToLatLng) }];
  }
  // MultiPolygon
  const polys = g.coordinates;
  if (!Array.isArray(polys)) return [];
  return (polys as number[][][][]).map((poly) => {
    const [outer, ...holes] = poly;
    return { outer: ringToLatLng(outer), holes: holes.map(ringToLatLng) };
  });
};

// Fallback bbox polygon (SW → SE → NE → NW)
const bboxToLatLng = (z: Zone): LatLng[] => [
  { latitude: z.lat_min, longitude: z.lng_min },
  { latitude: z.lat_min, longitude: z.lng_max },
  { latitude: z.lat_max, longitude: z.lng_max },
  { latitude: z.lat_max, longitude: z.lng_min },
];

// Simple center from bbox (robust & cheap)
const bboxCenter = (z: Zone): LatLng => ({
  latitude: (z.lat_min + z.lat_max) / 2,
  longitude: (z.lng_min + z.lng_max) / 2,
});

// Deterministic color per zone id
const colorFor = (id: number) => {
  const hue = (id * 53) % 360;
  return {
    stroke: `hsla(${hue}, 90%, 45%, 1)`,
    fill: `hsla(${hue}, 90%, 45%, 0.18)`,
    // Strong selected colors + halo
    strokeSelected: "#111111",
    fillSelected: `hsla(${hue}, 95%, 50%, 0.55)`,
    halo: "#ffffff",
  } as const;
};

export default function ZonesMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView | null>(null);

  // Floating label for selected zone (keeps text fully visible, never clipped)
  const [labelXY, setLabelXY] = useState<{ x: number; y: number } | null>(null);
  const [labelSize, setLabelSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Zone | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [fill, setFill] = useState(true);
  const [latDelta, setLatDelta] = useState(0.25); // track zoom to auto-hide labels

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("accessToken"); // optional
        const url = `${API_URL}/api/zones/public?include_polygon=1&active=all`;
        const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
        const json = await res.json();
        if (!res.ok || !json?.zones) throw new Error(json?.message || "Failed to fetch zones");
        setZones(json.zones as Zone[]);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Failed to load zones");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fit map to all zone coordinates (prefer polygon over bbox)
  const fitAll = () => {
    const coords: LatLng[] = [];
    zones.forEach((z) => {
      const parts = geojsonToParts(z.polygon_geojson);
      if (parts.length) {
        parts.forEach((p) => coords.push(...p.outer));
      } else {
        coords.push(...bboxToLatLng(z));
      }
    });
    if (coords.length && mapRef.current) {
      mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 60, bottom: 220, left: 60 }, animated: true });
    } else {
      Alert.alert("No zones to fit");
    }
  };

  // Fit to selected zone only
  const fitSelected = () => {
    if (!selected || !mapRef.current) return;
    const parts = geojsonToParts(selected.polygon_geojson);
    const coords: LatLng[] = [];
    if (parts.length) parts.forEach((p) => coords.push(...p.outer));
    else coords.push(...bboxToLatLng(selected));
    mapRef.current.fitToCoordinates(coords, { edgePadding: { top: 60, right: 60, bottom: 260, left: 60 }, animated: true });
  };

  // Place the floating label near the selected zone, clamped inside safe paddings
  const placeLabelAt = async (z: Zone) => {
    if (!mapRef.current) return;
    try {
      const center = bboxCenter(z);
      const pt = await (mapRef.current as any).pointForCoordinate(center);
      const { width, height } = Dimensions.get("window");
      const pad = 12;            // side padding
      const topPad = 72;         // header height
      const bottomPad = 220;     // bottom card area
      const x = Math.min(Math.max(pt.x, pad + labelSize.w / 2), width - pad - labelSize.w / 2);
      const y = Math.min(Math.max(pt.y - 14, topPad + pad + labelSize.h), height - bottomPad - pad);
      setLabelXY({ x, y });
    } catch (e) {
      setLabelXY(null);
    }
  };

  useEffect(() => { if (selected) placeLabelAt(selected); else setLabelXY(null); }, [selected]);

  const initialRegion = useMemo(
    () => ({ latitude: 1.3521, longitude: 103.8198, latitudeDelta: 0.25, longitudeDelta: 0.25 }),
    []
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#111827" />
        <Text className="mt-3 text-gray-700">Loading zones…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-white">
        <Text className="text-red-600 font-semibold mb-3">Failed to load zones</Text>
        <Text className="text-gray-700 text-center">{error}</Text>
        <TouchableOpacity className="mt-6 bg-gray-800 px-4 py-3 rounded-xl" onPress={() => router.back()}>
          <Text className="text-white font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-5 pb-3 border-b border-gray-200 relative bg-white">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Zone Map</Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ width: Dimensions.get("window").width, height: Dimensions.get("window").height }}
        initialRegion={initialRegion}
        customMapStyle={[
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        ]}
        mapPadding={{ top: 72, right: 12, bottom: 220, left: 12 }}
        paddingAdjustmentBehavior="always"
        onPress={() => setSelected(null)}
        onRegionChangeComplete={(r: Region) => {
          setLatDelta(r.latitudeDelta);
          if (selected) placeLabelAt(selected);
        }}
      >
        {zones.map((z) => {
          const parts = geojsonToParts(z.polygon_geojson);
          const { stroke, fill: fillColor, fillSelected, strokeSelected, halo } = colorFor(z.zone_id);
          const isSelected = selected?.zone_id === z.zone_id;

          // Fallback to bbox polygon if no geometry stored
          if (!parts.length) {
            const bboxCoords = bboxToLatLng(z);
            return (
              <React.Fragment key={`bbox-${z.zone_id}`}>
                {/* White halo underlay for selection */}
                {isSelected && (
                  <Polygon
                    coordinates={bboxCoords}
                    strokeWidth={6}
                    strokeColor={halo}
                    fillColor={"transparent"}
                    zIndex={1}
                  />
                )}
                <Polygon
                  coordinates={bboxCoords}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeColor={isSelected ? strokeSelected : stroke}
                  fillColor={fill ? (isSelected ? fillSelected : fillColor) : "transparent"}
                  tappable
                  onPress={() => setSelected(z)}
                  zIndex={2}
                />
                {(showLabels && latDelta <= 0.15 && !isSelected) && (
                  <Marker coordinate={bboxCenter(z)} anchor={{ x: 0.5, y: 1.0 }} zIndex={999}>
                    <View style={{ backgroundColor: "white", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, elevation: 3 }}>
                      <Text style={{ fontWeight: "700", fontSize: 12 }}>{z.zone_name}</Text>
                    </View>
                  </Marker>
                )}
              </React.Fragment>
            );
          }

          // Render all polygon parts (outer + holes)
          return (
            <React.Fragment key={`poly-${z.zone_id}`}>
              {/* Halo underlay for each part when selected */}
              {isSelected && parts.map((p, i) => (
                <Polygon
                  key={`halo-${z.zone_id}-${i}`}
                  coordinates={p.outer}
                  strokeWidth={6}
                  strokeColor={halo}
                  fillColor={"transparent"}
                  zIndex={1}
                />
              ))}

              {parts.map((p, i) => (
                <Polygon
                  key={`poly-${z.zone_id}-${i}`}
                  coordinates={p.outer}
                  holes={p.holes}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeColor={isSelected ? strokeSelected : stroke}
                  fillColor={fill ? (isSelected ? fillSelected : fillColor) : "transparent"}
                  tappable
                  onPress={() => setSelected(z)}
                  zIndex={2}
                />
              ))}

              {(showLabels && latDelta <= 0.15 && !isSelected) && (
                <Marker coordinate={bboxCenter(z)} anchor={{ x: 0.5, y: 1.0 }} zIndex={999}>
                  <View style={{ backgroundColor: "white", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, elevation: 3 }}>
                    <Text style={{ fontWeight: "700", fontSize: 12 }}>{z.zone_name}</Text>
                  </View>
                </Marker>
              )}
            </React.Fragment>
          );
        })}
      </MapView>

      {/* Floating label for selected zone (always fully visible) */}
      {selected && labelXY && (
        <View
          pointerEvents="none"
          style={{ position: "absolute", left: labelXY.x - labelSize.w / 2, top: labelXY.y - labelSize.h }}
        >
          <View
            onLayout={(e) => setLabelSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
            style={{
              backgroundColor: "white",
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 14,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
              maxWidth: 220,
            }}
          >
            <Text style={{ fontWeight: "800", fontSize: 12 }}>{selected.zone_name}</Text>
          </View>
        </View>
      )}

      {/* Top-right controls */}
      <View className="absolute right-4 top-24 space-y-3">
        <TouchableOpacity className="bg-white rounded-full px-4 py-2 shadow" onPress={fitAll}>
          <Text className="font-semibold text-gray-800">Fit to zones</Text>
        </TouchableOpacity>

        {selected && (
          <TouchableOpacity className="bg-white rounded-full px-4 py-2 shadow" onPress={fitSelected}>
            <Text className="font-semibold text-gray-800">Fit selected</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity className="bg-white rounded-full px-4 py-2 shadow" onPress={() => setShowLabels((s) => !s)}>
          <Text className="font-semibold text-gray-800">{showLabels ? "Hide labels" : "Show labels"}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-white rounded-full px-4 py-2 shadow" onPress={() => setFill((f) => !f)}>
          <Text className="font-semibold text-gray-800">{fill ? "Outline only" : "Fill zones"}</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom sheet-ish info card */}
      {selected && (
        <View className="absolute left-4 right-4 bottom-6 bg-white rounded-2xl p-4 shadow-lg" style={{ elevation: 6 }}>
          <Text className="text-base font-bold mb-1">{selected.zone_name}</Text>
          <Text className="text-xs text-gray-600 mb-2">{selected.geological_name}</Text>
          <Text className="text-sm text-gray-800">
            Rock type: <Text className="font-semibold">{selected.rock_type}</Text>
          </Text>
          <Text className="text-sm text-gray-800">
            Key rock: <Text className="font-semibold">{selected.key_rock}</Text>
          </Text>
          <Text className="text-xs text-gray-500 mt-2">
            bbox: [{selected.lat_min.toFixed(3)},{selected.lng_min.toFixed(3)}]→[{selected.lat_max.toFixed(3)},{selected.lng_max.toFixed(3)}]
          </Text>
        </View>
      )}
    </View>
  );
}
