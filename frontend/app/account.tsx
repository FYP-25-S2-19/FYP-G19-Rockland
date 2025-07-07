"use client";

import React from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProfilePicture from "../assets/images/profilepicture.png";
import CrownIcon from "../assets/images/crown.svg";
import SettingIcon from "../assets/images/Settings.svg";
import ArrowRightIcon from "../assets/images/arrow_right.svg";
import AccountActiveIcon from "../assets/icons/account_active.svg";
import BackpackIcon from "../assets/images/backpack.svg";
import TradeIcon from "../assets/images/tradeicon.svg";
import MedalIcon from "../assets/images/medalicon.svg";
import { LinearGradient } from "expo-linear-gradient";

type MenuItemProps = {
  icon: React.ComponentType<{ width: number; height: number; fill?: string }>;
  label: string;
  onPress: () => void;
  last?: boolean;
};

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
};

export default function AccountScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const queryClient = useQueryClient();

  // Fetch user profile from API using accessToken stored in AsyncStorage
  const fetchUserProfile = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    const response = await fetch(`${API_URL}/api/users/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Error fetching profile: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    const raw = await response.text();

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server returned non-JSON response");
    }

    const data = JSON.parse(raw);
    if (!data.success) throw new Error(data.error || "Failed to fetch user profile");

    // Save role to AsyncStorage for global use
    const role = data.user.user_type_name?.toLowerCase() || "free";
    await AsyncStorage.setItem("userRole", role);

    return {
      fullName: `${data.user.first_name} ${data.user.last_name}`,
      role,
      user: data.user,
    };
  };

  // Use React Query for user profile with cache and refetch
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 60000,
    retry: 1,
  });

  // Navigation handlers
  const handleSettings = () => router.push("/settings");
  const handleProfile = () => router.push("/profile");
  const handleSubscribe = () => console.log("Subscribe Now pressed");
  const handleMyCollection = () => router.push("/mycollection");
  const handleBadgesAndAchievements = () => router.push("/badges");
  const handleTradeList = () => router.push("/tradelist");
  const handleSettingsNavigation = () => router.push("/settings");

  const MenuItem = ({ icon: Icon, label, onPress, last = false }: MenuItemProps) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center py-5 ${!last ? "border-b border-gray-100" : ""}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-x-5">
        <Icon width={20} height={20} fill="gray" />
        <Text className="text-base font-medium text-gray-900">{label}</Text>
      </View>
      <ArrowRightIcon width={18} height={18} fill="gray" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#459B6C" />
        <Text className="text-lg text-gray-500 mt-2">Loading account...</Text>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-lg text-red-600 text-center mb-4">Failed to load account data.</Text>
        <TouchableOpacity className="bg-green-600 py-3 px-6 rounded-xl" onPress={() => refetch()}>
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { fullName, role: userRole } = data;
  const gradientColors =
    userRole === "premium"
      ? (["#EF9E1C", "#FDE68A"] as const)
      : (["#459B6C", "#AFDBB8"] as const);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              height: 200,
              justifyContent: "flex-start",
              paddingTop: 20,
              paddingHorizontal: 20,
              borderBottomLeftRadius: 30,
              borderBottomRightRadius: 30,
              marginBottom: 30,
            }}
          >
            <Text className="text-white text-2xl font-bold text-center">Account</Text>
            <TouchableOpacity
              onPress={handleSettings}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(255,255,255,0.3)",
                borderRadius: 999,
                padding: 6,
              }}
            >
              <SettingIcon width={24} height={24} fill="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View
            className="bg-gray-50 rounded-t-3xl -mt-20 px-5 pt-10"
            style={{ flex: 1 }}
          >
            <View style={{ alignItems: "center", marginTop: -100 }}>
              <View
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 8,
                  borderRadius: 100,
                  backgroundColor: "white",
                }}
              >
                <Image
                  source={ProfilePicture}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 100,
                    borderWidth: 6,
                    borderColor: "white",
                  }}
                />
              </View>
            </View>

            <View className="items-center mt-4 mb-4">
              <Text className="text-2xl font-bold text-gray-900">{fullName || "User"}</Text>
              <View className="flex-row items-center mt-2">
                {userRole === "premium" && (
                  <CrownIcon
                    width={18}
                    height={18}
                    fill="#EF9E1C"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  className={`text-base ${
                    userRole === "premium"
                      ? "text-[#EF9E1C] font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {userRole === "premium"
                    ? "Premium User"
                    : userRole === "expert"
                    ? "Expert User"
                    : "Free User"}
                </Text>
              </View>
            </View>

            <View className="flex-row mb-10">
              <TouchableOpacity
                className="flex-1 bg-green-600 py-4 rounded-xl items-center justify-center mr-1.5 relative"
                onPress={handleProfile}
                activeOpacity={0.8}
                style={shadowStyle}
              >
                <View className="absolute left-4">
                  <AccountActiveIcon width={20} height={20} />
                </View>
                <Text className="text-white text-base font-semibold">Profile</Text>
              </TouchableOpacity>

              {userRole === "free" && (
                <TouchableOpacity
                  className="flex-1 bg-[#EF9E1C] py-4 rounded-xl items-center justify-center ml-1.5 relative"
                  onPress={handleSubscribe}
                  activeOpacity={0.8}
                  style={shadowStyle}
                >
                  <View className="absolute left-4">
                    <CrownIcon width={20} height={20} fill="white" />
                  </View>
                  <Text className="text-white text-base font-semibold ml-4">
                    Subscribe Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {userRole === "free" && (
                <MenuItem
                  icon={BackpackIcon}
                  label="My Collection"
                  onPress={handleMyCollection}
                />
              )}
              {userRole === "premium" && (
                <>
                  <MenuItem
                    icon={BackpackIcon}
                    label="My Collection"
                    onPress={handleMyCollection}
                  />
                  <MenuItem
                    icon={TradeIcon}
                    label="Trade Rock Collection"
                    onPress={handleTradeList}
                  />
                  <MenuItem
                    icon={MedalIcon}
                    label="Badges and Achievements"
                    onPress={handleBadgesAndAchievements}
                  />
                </>
              )}
              {userRole === "expert" && (
                <Text className="text-center text-gray-500 py-4">
                  No menu for expert user yet.
                </Text>
              )}
              <MenuItem
                icon={SettingIcon}
                label="Settings"
                onPress={handleSettingsNavigation}
                last
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
