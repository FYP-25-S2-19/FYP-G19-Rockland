"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTabBar from "../components/BottomTabBar";
import ProfilePicture from "../assets/images/profilepicture.png";
import CrownIcon from "../assets/images/crown.svg";
import SettingIcon from "../assets/images/Settings.svg";
import ArrowRightIcon from "../assets/images/arrow_right.svg";
import AccountActiveIcon from "../assets/icons/account_active.svg";
import BackpackIcon from "../assets/images/backpack.svg";
import AddIcon from "../assets/images/addicon.svg";
import TradeIcon from "../assets/images/tradeicon.svg";
import MedalIcon from "../assets/images/medalicon.svg";
import { LinearGradient } from 'expo-linear-gradient';

export default function AccountScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("free");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) throw new Error("No token found");

        const response = await fetch("http://192.168.110.43:5000/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          setUserName(`${data.user.first_name} ${data.user.last_name}`);
          setUserRole(data.user.user_type?.name?.toLowerCase() || "free");
          await AsyncStorage.setItem("userRole", data.user.user_type?.name?.toLowerCase() || "free");
        } else {
          console.log("❌ Failed to load user", data.error);
        }
      } catch (err) {
        console.error("🔐 Login error:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSettings = () => router.push("/settings");
  const handleProfile = () => router.push("/profile");
  const handleSubscribe = () => console.log("Subscribe Now pressed");
  const handleMyCollection = () => router.push("/mycollection");
  const handleBadgesAndAchievements = () => router.push("/badges");
  const handleTradeList = () => router.push("/tradelist");
  const handleAddRock = () => router.push("/AddRockScreen");
  const handleExpertQuiz = () => router.push("/expert/quizhome");
  const handleSettingsNavigation = () => router.push("/settings");

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  };

  type MenuItemProps = {
    icon: React.ComponentType<{ width: number; height: number; fill?: string }>;
    label: string;
    onPress: () => void;
    last?: boolean;
  };

  const MenuItem = ({
    icon: Icon,
    label,
    onPress,
    last = false,
  }: MenuItemProps) => (
    <TouchableOpacity
      className={`flex-row justify-between items-center py-5 ${
        !last ? "border-b border-gray-100" : ""
      }`}
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          {/* HEADER SECTION */}
          <LinearGradient
            colors={
              userRole === 'premium'
                ? ['#EF9E1C', '#FDE68A']
                : ['#459B6C', '#AFDBB8']
            }
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              height: 200,
              justifyContent: 'flex-start',
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
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 999,
                padding: 6,
              }}
            >
              <SettingIcon width={24} height={24} fill="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* CONTENT SECTION */}
          <View className="bg-gray-50 rounded-t-3xl -mt-20 px-5 pt-10" style={{ flex: 1 }}>
            {/* PROFILE IMAGE */}
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

            {/* USER NAME + ROLE */}
            <View className="items-center mt-4 mb-4">
              <Text className="text-2xl font-bold text-gray-900">
                {userName || "User"}
              </Text>
              <View className="flex-row items-center mt-2">
                {userRole === "premium" && (
                  <CrownIcon width={18} height={18} fill="#EF9E1C" style={{ marginRight: 4 }} />
                )}
                <Text
                  className={`text-base ${
                    userRole === "premium"
                      ? "text-[#EF9E1C] font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {userRole === "premium" ? "Premium User" : "Free User"}
                </Text>
              </View>
            </View>

            {/* Top Buttons */}
            <View className="flex-row mb-10">
              <TouchableOpacity
                className="flex-1 bg-green-600 py-4 rounded-xl items-center justify-center mr-1.5 relative"
                onPress={handleProfile}
                activeOpacity={0.8}
                style={[shadowStyle]}
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
                  style={[shadowStyle]}
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

            {/* Menu List */}
            <View>
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
                <MenuItem icon={BackpackIcon} label="My Collection" onPress={handleMyCollection} />
                {userRole === "premium" && (
                  <>
                    <MenuItem icon={AddIcon} label="Add New Rock Entry" onPress={handleAddRock} />
                    <MenuItem icon={TradeIcon} label="Trade Rock Collection" onPress={handleTradeList} />
                    <MenuItem icon={MedalIcon} label="Badges and Achievements" onPress={handleBadgesAndAchievements} />
                    <MenuItem icon={AddIcon} label="Expert Quiz Home Page" onPress={handleExpertQuiz} />
                  </>
                )}
                <MenuItem icon={SettingIcon} label="Settings" onPress={handleSettingsNavigation} last />
              </View>
            </View>
          </View>
        </ScrollView>

        <BottomTabBar activeTab="Account" />
      </View>
    </SafeAreaView>
  );
}
