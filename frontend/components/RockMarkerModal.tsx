import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
    photo_url?: string;
    signed_url?: string;
  };
}

interface RockMarkerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (spawnData: RockSpawn) => void | Promise<void>;
  onExpire?: () => void | Promise<void>;
  rock: RockSpawn | null;

  // NEW (optional) props
  canCollect?: boolean;            // default: true
  distanceMeters?: number;         // e.g., 132
  collectRadiusMeters?: number;    // default: 150
}

const RockMarkerModal: React.FC<RockMarkerModalProps> = ({
  visible,
  onClose,
  onSave,
  onExpire,
  rock,
  canCollect = true,
  distanceMeters,
  collectRadiusMeters = 150,
}) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!rock || !rock.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(rock.expires_at).getTime();
      const diff = Math.max(0, expiry - now);

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        // Trigger refresh + close modal
        Promise.resolve(onExpire?.()).finally(onClose);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [rock]);

  if (!rock || !rock.rock) return null;
  const r = rock.rock;

  const safeRarity = r.rarity?.toLowerCase?.() || "unknown";
  const rarityBg =
    safeRarity === "common" ? "#6D6D6D"
    : safeRarity === "rare" ? "#459B6C"
    : "#EF9E1C";

  const rarityText = r.rarity
    ? r.rarity.charAt(0).toUpperCase() + r.rarity.slice(1)
    : "Unknown";

  const isExpired = timeLeft === "Expired";
  const disabled = isExpired || !canCollect;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50 px-4 pb-4">
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "80%",
            width: "100%",
            position: "relative",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 32,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Close */}
            <TouchableOpacity
              onPress={onClose}
              style={{ position: "absolute", top: 12, right: 12 }}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            {/* Image */}
            {r.signed_url || r.photo_url ? (
              <Image
                source={{ uri: r.signed_url || r.photo_url! }}
                style={{
                  width: 180,
                  height: 180,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 176,
                  height: 176,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              />
            )}

            <Text className="text-2xl font-bold text-center mb-1">
              {r.rock_name}
            </Text>
            <Text className="text-l text-gray-600 mb-2">Type: {r.rock_type}</Text>

            <View className="px-3 py-1 rounded-full mb-3" style={{ backgroundColor: rarityBg }}>
              <Text className="text-white text-sm font-semibold">
                Rarity: {rarityText}
              </Text>
            </View>

            <Text className="text-center text-gray-700 text-sm mb-4">
              {r.description}
            </Text>

            {/* Distance + hint */}
            {typeof distanceMeters === "number" && (
              <Text
                className="text-sm mb-2"
                style={{ color: disabled ? "#b91c1c" : "#065f46", fontWeight: "600" }}
              >
                {Math.round(distanceMeters)} m away
                {!canCollect ? ` — move within ${collectRadiusMeters} m to collect` : ""}
              </Text>
            )}

            {/* Countdown */}
            <Text className="text-sm text-red-600 font-semibold mb-2">
              Expires in: {timeLeft || "—"}
            </Text>

            {/* Save Button */}
            {!isExpired ? (
              <TouchableOpacity
                disabled={disabled}
                onPress={() => onSave(rock)}
                className="w-full py-2 rounded-lg mb-2 items-center"
                style={{ backgroundColor: disabled ? "#9ca3af" : "#459B6C" }}
              >
                <Text className="text-white font-bold text-base">
                  {disabled ? "Move closer" : "Save to Collection"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500 mb-2">Rock expired</Text>
            )}

            {/* Read More */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/viewrock/[id]",
                  params: { id: r.rock_id.toString() },
                })
              }
              className="mb-4"
            >
              <Text className="text-black underline font-semibold">Read More</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default RockMarkerModal;
