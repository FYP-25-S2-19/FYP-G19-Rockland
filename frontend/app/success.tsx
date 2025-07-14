import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SuccessScreen() {
  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  };

  return (
    <LinearGradient
      colors={["#91D29E", "#FFFFFF"]}
      start={{ x: -1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-transparent px-6">
        <View className="bg-white rounded-2xl px-6 py-10 w-full items-center" style={shadowStyle}>
          <Text className="text-3xl font-bold text-green-700 mb-3">✅ Success!</Text>
          <Text className="text-base text-gray-700 text-center">
            Your payment was successful. Welcome to Rockland Premium!
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
