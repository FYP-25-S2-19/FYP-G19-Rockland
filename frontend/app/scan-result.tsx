import React from "react";
import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import BottomTabBar from "../components/BottomTabBar";
import { useRouter } from "expo-router";

export default function ScanResultScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-4">
        <Image
          source={{ uri: "https://via.placeholder.com/300x300" }}
          className="w-80 h-80 rounded-xl mb-6"
          resizeMode="cover"
        />
        <Text className="text-xl font-bold text-gray-900 mb-2">Result</Text>
        <Text className="text-center text-gray-600 mb-6">
          This will later display ML output. For now it's a prototype result.
        </Text>

        <TouchableOpacity
          className="bg-green-600 py-3 px-10 rounded-xl"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white font-semibold text-lg">Back to Home</Text>
        </TouchableOpacity>
      </View>

      <BottomTabBar activeTab="Scan" />
    </SafeAreaView>
  );
}
