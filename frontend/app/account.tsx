"use client";

import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import BottomTabBar from "../components/BottomTabBar";

export default function AccountScreen() {
  const router = useRouter();

  const handleSettings = () => {
    console.log("Settings pressed");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSubscribe = () => {
    console.log("Subscribe Now pressed");
  };

  const handleMyCollection = () => {
    console.log("My Collection pressed");
  };

  const handleSettingsNavigation = () => {
    console.log("Settings navigation pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center flex-1">
            <View className="w-15 h-15 rounded-full bg-gray-100 justify-center items-center mr-4">
              <Text className="text-4xl text-gray-400">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">Anna Kim</Text>
              <Text className="text-sm text-gray-500">Free User</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleSettings} activeOpacity={0.7} className="p-2">
            <Text className="text-2xl">⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mb-10 space-x-3">
          <TouchableOpacity
            className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            onPress={handleProfile}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-orange-500 py-4 rounded-xl items-center"
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">Subscribe Now</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation List */}
        <View className="flex-1">
          <TouchableOpacity
            className="flex-row justify-between items-center py-5 border-b border-gray-100"
            onPress={handleMyCollection}
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-gray-900">My Collection</Text>
            <Text className="text-xl text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-between items-center py-5 border-b border-gray-100"
            onPress={handleSettingsNavigation}
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-gray-900">Setting</Text>
            <Text className="text-xl text-gray-400">›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacer */}
        <View className="h-10" />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab="Account" />
    </SafeAreaView>
  );
}
