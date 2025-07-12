"use client";

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../assets/images/back.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Badge = {
  id: number;
  description: string;
  score: number;
  earned: boolean;
  date_achieved?: string | null;
  progress_percent?: number | null;
};

export default function BadgesProgressScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"All" | "Earned">("All");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/api/achievements/full`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setBadges(json.achievements || []);
        else console.error("Failed to fetch:", json.message);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleBack = () => router.back();

  const filteredBadges =
    activeTab === "Earned"
      ? badges.filter((b) => b.earned)
      : badges;

  const totalPoints = badges
    .filter((b) => b.earned)
    .reduce((sum, b) => sum + b.score, 0);

  const earnedCount = badges.filter((b) => b.earned).length;

  const renderBadgeCard = (badge: Badge) => {
    const isCompleted = badge.earned;
    return (
      <View key={badge.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
        <View className="space-y-2">
          <Text className="text-gray-900 font-semibold text-base">{badge.description}</Text>

          {isCompleted ? (
            <Text className="text-green-600 text-xs font-medium">
              +{badge.score} points · {badge.date_achieved}
            </Text>
          ) : badge.progress_percent != null ? (
            <>
              <View className="my-2">
                <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <View
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${badge.progress_percent}%` }}
                  />
                </View>
                <Text className="text-gray-500 text-xs mt-1">{badge.progress_percent}% complete</Text>
              </View>
              <Text className="text-gray-600 text-xs font-medium">
                +{badge.score} points when completed
              </Text>
            </>
          ) : (
            <Text className="text-gray-400 text-xs font-medium">Locked</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-gray-900 font-semibold text-lg">Badges & Progress</Text>
        <View className="w-6" />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row px-4 py-5 space-x-3">
            <View className="flex-1 bg-gray-100 rounded-xl p-4 shadow-sm">
              <Text className="text-gray-900 font-bold text-2xl text-center">{earnedCount}</Text>
              <Text className="text-gray-600 text-sm text-center mt-1">Earned</Text>
            </View>
            <View className="flex-1 bg-gray-100 rounded-xl p-4 shadow-sm">
              <Text className="text-gray-900 font-bold text-2xl text-center">{totalPoints}</Text>
              <Text className="text-gray-600 text-sm text-center mt-1">Total Points</Text>
            </View>
          </View>

          <View className="flex-row px-4 mb-5">
            {(["All", "Earned"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                className={`flex-1 py-3 border-b-2 ${
                  activeTab === tab ? "border-green-500" : "border-transparent"
                }`}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  className={`text-center font-medium ${
                    activeTab === tab ? "text-green-600 font-semibold" : "text-gray-600"
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="px-4">
            {filteredBadges.length > 0 ? (
              filteredBadges.map(renderBadgeCard)
            ) : (
              <View className="items-center py-16 px-8">
                <Text className="text-gray-600 text-center text-base leading-6">
                  No badge progress yet. Start completing activities!
                </Text>
              </View>
            )}
          </View>

          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
