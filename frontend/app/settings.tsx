import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Modal, Pressable } from "react-native";
import BackIcon from "../assets/images/back.svg";

export default function SettingsScreen() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleUpdateInfo = () => {
    console.log("Update Personal Information");
  };

  const handleUpgrade = () => {
    console.log("Upgrade Account to Premium");
  };

  const handleFAQ = () => {
    console.log("FAQ Page");
  };

  const handleApplyExpert = () => {
    router.push("/expertapplication");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    console.log("Logged out");
    router.replace("/login"); 
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-8 relative">
          <TouchableOpacity onPress={handleGoBack} className="absolute left-0">
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Settings</Text>
        </View>

        {/* Settings Buttons */}
        <View className="space-y-4">
          <TouchableOpacity className="bg-gray-700 py-4 rounded-xl items-center mb-2" onPress={handleUpdateInfo}>
            <Text className="text-white text-base font-semibold">Update Personal Information</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-700 py-4 rounded-xl items-center mb-2" onPress={handleUpgrade}>
            <Text className="text-white text-base font-semibold">Upgrade Account to Premium</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-700 py-4 rounded-xl items-center mb-2" onPress={handleFAQ}>
            <Text className="text-white text-base font-semibold">FAQ Page</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-gray-700 py-4 rounded-xl items-center mb-2" onPress={handleApplyExpert}>
            <Text className="text-white text-base font-semibold">Apply to be Expert</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="mt-10 mb-5">
          <TouchableOpacity className="bg-red-600 py-4 rounded-xl items-center" onPress={handleLogout}>
            <Text className="text-white text-base font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text className="text-center text-black font-bold text-sm mb-5">
          App Version : 1.0.0
        </Text>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="text-lg font-bold mb-4">Confirm Logout</Text>
            <Text className="text-sm mb-6">Are you sure you want to log out?</Text>
            <View className="flex-row justify-between">
              <Pressable className="bg-gray-300 py-3 px-6 rounded-xl" onPress={() => setShowLogoutModal(false)}>
                <Text className="text-black font-semibold">Cancel</Text>
              </Pressable>
              <Pressable className="bg-red-600 py-3 px-6 rounded-xl" onPress={confirmLogout}>
                <Text className="text-white font-semibold">Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
