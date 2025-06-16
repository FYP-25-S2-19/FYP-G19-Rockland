"use client";

import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import BottomTabBar from "../components/BottomTabBar";
import Bedrock from "../assets/images/bedrock-placeholder-home.jpg";
import Popular from "../assets/images/article-placeholder-home.jpeg";
import Article from "../assets/images/article-placeholder-home-2.jpeg";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleArticlePress = (article: string) => {
    console.log(`Article pressed: ${article}`);
  };

  const rocks = [
    {
      id: 1,
      name: "Bedrock",
      category: "Igneous Rock",
      rarity: "Common",
      image: Bedrock,
    },
    {
      id: 2,
      name: "Bedcover",
      category: "Igneous Rock",
      rarity: "Rare",
      image: Bedrock,
    },
    {
      id: 3,
      name: "Bedcover",
      category: "Igneous Rock",
      rarity: "Legendary",
      image: Bedrock,
    },
  ];

  const popularImages = [Popular, Popular, Popular, Popular];

  const filteredRocks = rocks.filter((rock) =>
    rock.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-5 pb-6">
          <Text className="text-3xl font-bold text-black mb-1">ROCKLAND</Text>
          <Text className="text-sm text-blue-500">
            #1 Rock Learning Platform
          </Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
            <Text className="text-lg mr-3">🔍</Text>
            <TextInput
              className="flex-1 text-base text-gray-800"
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search rocks, minerals..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Unlock Features */}
        <TouchableOpacity
          className="flex-row items-center bg-yellow-500 mx-5 py-4 px-5 rounded-xl mb-5"
          activeOpacity={0.8}
        >
          <Text className="text-xl mr-3">👑</Text>
          <Text className="flex-1 text-base font-semibold text-white">
            Tap to unlock full features
          </Text>
          <Text className="text-lg text-white">→</Text>
        </TouchableOpacity>

        {/* Quiz & Leaderboard */}
        <View className="flex-row px-5 mb-8 space-x-3">
          <TouchableOpacity
            className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-white">
              Take Quiz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-green-600 py-4 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-base font-semibold text-white">
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular on Rockland */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Popular on Rockland
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {popularImages.map((img, i) => (
              <Image
                key={i}
                source={img}
                style={{
                  width: "48%",
                  height: 120,
                  borderRadius: 12,
                }}
                resizeMode="stretch"
              />
            ))}
          </View>
        </View>

        {/* Rock Results */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Rock Results
          </Text>
          {filteredRocks.map((rock, index) => {
            const containerClass =
              "flex-row items-center bg-white p-3 border-b border-gray-200 " +
              (index === 0 ? "border-2 border-blue-500" : "");

            const badgeClass =
              "px-3 py-1 rounded-full " +
              (rock.rarity === "Rare"
                ? "bg-green-500"
                : rock.rarity === "Legendary"
                  ? "bg-yellow-500"
                  : "bg-gray-400");

            return (
              <TouchableOpacity
                key={rock.id}
                className={containerClass}
                activeOpacity={0.8}
              >
                <Image
                  source={rock.image}
                  style={{
                    width: 60,
                    height: 60,
                    marginRight: 12,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">
                    {rock.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Category: {rock.category}
                  </Text>
                </View>
                <View className={badgeClass}>
                  <Text className="text-xs font-medium text-white">
                    {rock.rarity}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top Articles */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Top Articles
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handleArticlePress("geological rocks")}
              activeOpacity={0.8}
            >
              <Image
                source={Article}
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: "red",
                }}
                resizeMode="stretch"
              />
              <Text className="text-sm text-gray-700 leading-5">
                What are the type of geological rocks?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => handleArticlePress("rock formation")}
              activeOpacity={0.8}
            >
              <Image
                source={Article}
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: 2,
                  borderColor: "blue",
                }}
                resizeMode="stretch"
              />
              <Text className="text-sm text-gray-700 leading-5">
                How do sedimentary rocks form?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-5" />
      </ScrollView>

      {/* Bottom Tab */}
      <BottomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}
