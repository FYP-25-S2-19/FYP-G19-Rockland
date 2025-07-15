import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import TrashIcon from "../assets/images/trash.svg";

interface RockCardProps {
  image: any;
  name: string;
  type: string;
  rarity: "Common" | "Rare" | "Legendary";
  method: "Scanned" | "Discovered";
  location: string;
  collectedDate: string;
  onDelete?: () => void;
}

export default function SavedRockCard({
  image,
  name,
  type,
  rarity,
  method,
  location,
  collectedDate,
  onDelete,
}: RockCardProps) {
  const rarityColor = {
    Common: "bg-gray-300 text-black",
    Rare: "bg-green-600 text-white",
    Legendary: "bg-[#EF9E1C] text-white",
  };
  const methodColor = {
  Scanned: "bg-blue-500 text-white",
  Discovered: "bg-purple-500 text-white",
  };
  

  return (
    <View className="bg-white rounded-xl border border-black p-2 relative w-full">
      {/* Trash Button */}
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          className="absolute top-[-8px] right-[-8px] bg-white rounded-[6px] p-1 border border-black z-10"
        >
          <TrashIcon width={18} height={18} />
        </TouchableOpacity>
      )}

      {/* Rock Image */}
      <Image
        source={image}
        className="w-[135px] h-[115px] rounded-md self-center mb-2"
        resizeMode="cover"
      />

      {/* Rock Info */}
      <Text className="font-bold text-black text-base">{name}</Text>
      <Text className="text-sm text-gray-700 mb-1">Type: {type}</Text>

      {/* Labels */}
      <View className="flex-row space-x-2 mb-1">
      <Text
        style={{
          marginRight: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: "600",
          backgroundColor:
            rarity === "Common"
              ? "#D1D5DB" // gray-300
              : rarity === "Rare"
              ? "#16A34A" // green-600
              : "#EF9E1C", // legendary
          color: rarity === "Common" ? "#000000" : "#FFFFFF",
        }}
      >
        {rarity}
      </Text>
      <Text
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: "600",
        backgroundColor: method === "Scanned" ? "#3B82F6" : "#8B5CF6", // blue/purple
        color: "#FFFFFF",
      }}
    >
      {method}
    </Text>
      </View>

      {/* Details */}
      <Text className="text-sm text-black">
        <Text className="font-semibold">Location:</Text> {location}
      </Text>
      <Text className="text-sm text-black">
        <Text className="font-semibold">Collected:</Text> {collectedDate}
      </Text>
    </View>
  );
}
