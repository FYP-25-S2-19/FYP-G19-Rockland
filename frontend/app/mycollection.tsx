import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import BackIcon from "../assets/images/back.svg";

export default function MyCollectionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      
      {/* Header */}
      <View className="flex-row items-center justify-center py-5 relative">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-5">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Collection</Text>
      </View>

      {/* Content */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">This is My Collection Page</Text>
      </View>

    </SafeAreaView>
  );
}
