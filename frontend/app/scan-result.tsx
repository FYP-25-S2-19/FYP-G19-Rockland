import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";

// Function to randomize rarity
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
  const image = typeof params.image === "string" ? params.image : undefined;
  const router = useRouter();

  const rarity = getRandomRarity();
  const displayImage = image ?? "https://via.placeholder.com/200";

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
        source={{ uri: displayImage }}
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

      {/* Input Fields */}
      <View className="mt-8">
        <Text className="text-[12px] text-[#374151] mb-1.5">Rock Name</Text>
        <View className="w-[295px] h-[46px] border border-[#D1D5DB] rounded-lg px-3 flex-row items-center">
          <Text className="text-[14px] text-[#111827]">Granite</Text>
        </View>

        <Text className="text-[12px] text-[#374151] mt-4 mb-1.5">Rock Type</Text>
        <View className="w-[295px] h-[46px] border border-[#D1D5DB] rounded-lg px-3 flex-row items-center">
          <Text className="text-[14px] text-[#111827]">Igneous</Text>
        </View>
      </View>
      <View className="mt-8 w-[295px] space-y-4">
        <TouchableOpacity className="bg-green-600 py-3 rounded-lg items-center mb-4" activeOpacity={0.8}>
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
