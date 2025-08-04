import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
    }
    fetchUserRole();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

 const handleUpdateInfo = () => {
  if (userRole === "expert") {
    router.push("/(expert-tabs)/profile");
  } else {
    router.push("/(tabs)/profile");
  }
};

  const handleUpgrade = () => {
    router.push("/subscribe-premium");
  };

  const handleFAQ = () => {
    router.push("/faq");
  };

  const handleApplyExpert = () => {
    router.push("/expertapplication");
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("userRole");
      await queryClient.resetQueries({ queryKey: ["userProfile"] });
      console.log("✅ Logged out and cleared storage");
      router.replace("/login");
    } catch (err) {
      console.error("❌ Failed to logout:", err);
    } finally {
      setShowLogoutModal(false);
    }
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

        {/* Buttons */}
        <View className="space-y-4">
          <TouchableOpacity
            className="bg-gray-700 py-4 rounded-xl items-center mb-2"
            onPress={handleUpdateInfo}
          >
            <Text className="text-white text-base font-semibold">
              Update Personal Information
            </Text>
          </TouchableOpacity>

          {/* Show Upgrade if role is not premium or expert */}
          {userRole !== "premium" && userRole !== "expert" && (
            <TouchableOpacity
              className="bg-gray-700 py-4 rounded-xl items-center mb-2"
              onPress={handleUpgrade}
            >
              <Text className="text-white text-base font-semibold">
                Upgrade Account to Premium
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="bg-gray-700 py-4 rounded-xl items-center mb-2"
            onPress={handleFAQ}
          >
            <Text className="text-white text-base font-semibold">FAQ Page</Text>
          </TouchableOpacity>

          {/* Show Apply Expert if role is NOT expert */}
          {userRole !== "expert" && (
            <TouchableOpacity
              className="bg-gray-700 py-4 rounded-xl items-center mb-2"
              onPress={handleApplyExpert}
            >
              <Text className="text-white text-base font-semibold">
                Apply to be Expert
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
        <View className="mt-10 mb-5">
          <TouchableOpacity
            className="bg-red-600 py-4 rounded-xl items-center"
            onPress={handleLogout}
          >
            <Text className="text-white text-base font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text className="text-center text-black font-bold text-sm mb-5">
          App Version : 1.0.0
        </Text>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="text-lg font-bold mb-4">Confirm Logout</Text>
            <Text className="text-sm mb-6">
              Are you sure you want to log out?
            </Text>
            <View className="flex-row justify-between">
              <Pressable
                className="bg-gray-300 py-3 px-6 rounded-xl"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-black font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-red-600 py-3 px-6 rounded-xl"
                onPress={confirmLogout}
              >
                <Text className="text-white font-semibold">Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
