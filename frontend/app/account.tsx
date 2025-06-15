"use client";

import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomTabBar from "../components/BottomTabBar";
import ProfilePicture from "../assets/images/profilepicture.png";
import CrownIcon from "../assets/images/crown.svg"; 
import SettingIcon from "../assets/images/Settings.png";

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSettings = () => {
    router.push("/settings");
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
    router.push("/settings");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 20 }}
      >
        {/* Centered Profile */}
        <View className="items-center mb-8">
          <Image source={ProfilePicture} style={{ width: 100, height: 100, borderRadius: 50 }} />
          <Text className="text-xl font-bold text-gray-900 mt-4">Anna Kim</Text>
          <Text className="text-sm text-gray-500 mt-1">Free User</Text>

          <TouchableOpacity onPress={handleSettings} className="absolute top-0 right-0 p-2">
            <Image source={SettingIcon} style={{ width: 24, height: 24 }} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row mb-10">
          <TouchableOpacity
            className="flex-1 bg-green-600 py-4 rounded-xl items-center flex-row justify-center mr-1.5"
            onPress={handleProfile}
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-semibold">Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-[#EF9E1C] py-4 rounded-xl items-center flex-row justify-center ml-1.5"
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <CrownIcon style={{ width: 20, height: 20, marginRight: 8 }} fill="white" />
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
            <Text className="text-base font-medium text-gray-900">Settings</Text>
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
