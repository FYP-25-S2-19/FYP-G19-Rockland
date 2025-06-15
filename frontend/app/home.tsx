import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import BottomTabBar from "../components/BottomTabBar";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleArticlePress = (article: string) => {
    console.log(`Article pressed: ${article}`);
  };

  const rocks = [
    { id: 1, name: "Bedrock", category: "Igneous Rock", rarity: "Common", image: { uri: "https://via.placeholder.com/48" } },
    { id: 2, name: "Bedcover", category: "Igneous Rock", rarity: "Rare", image: { uri: "https://via.placeholder.com/48" } },
    { id: 3, name: "Bedcover", category: "Igneous Rock", rarity: "Legendary", image: { uri: "https://via.placeholder.com/48" } },
  ];

  const filteredRocks = rocks.filter((rock) =>
    rock.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-5 pb-6">
          <Text className="text-3xl font-bold text-black mb-1">ROCKLAND</Text>
          <Text className="text-sm text-blue-500">#1 Rock Learning Platform</Text>
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
        <TouchableOpacity className="flex-row items-center bg-yellow-500 mx-5 py-4 px-5 rounded-xl mb-5" activeOpacity={0.8}>
          <Text className="text-xl mr-3">👑</Text>
          <Text className="flex-1 text-base font-semibold text-white">Tap to unlock full features</Text>
          <Text className="text-lg text-white">→</Text>
        </TouchableOpacity>

        {/* Quiz & Leaderboard */}
        <View className="flex-row px-5 mb-8 space-x-3">
          <TouchableOpacity className="flex-1 bg-green-600 py-4 rounded-xl items-center" activeOpacity={0.8}>
            <Text className="text-base font-semibold text-white">Take Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-green-600 py-4 rounded-xl items-center" activeOpacity={0.8}>
            <Text className="text-base font-semibold text-white">Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Popular on Rockland */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Popular on Rockland</Text>
          <View className="flex-row flex-wrap justify-between">
            {[1, 2, 3, 4].map((_, i) => (
              <View key={i} className="w-[47%] aspect-square bg-gray-200 rounded-xl mb-3" />
            ))}
          </View>
        </View>

        {/* Rock Results */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Rock Results</Text>
          {filteredRocks.map((rock, index) => {
            const containerClass =
              "flex-row items-center bg-white p-3 border-b border-gray-200 " + (index === 0 ? "border-2 border-blue-500" : "");

            const badgeClass =
              "px-3 py-1 rounded-full " +
              (rock.rarity === "Rare"
                ? "bg-green-500"
                : rock.rarity === "Legendary"
                ? "bg-yellow-500"
                : "bg-gray-400");

            return (
              <TouchableOpacity key={rock.id} className={containerClass} activeOpacity={0.8}>
                <Image source={rock.image} className="w-12 h-12 mr-3 rounded" />
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-900">{rock.name}</Text>
                  <Text className="text-sm text-gray-500">Category: {rock.category}</Text>
                </View>
                <View className={badgeClass}>
                  <Text className="text-xs font-medium text-white">{rock.rarity}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Top Articles */}
        <View className="px-5 mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-4">Top Articles</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity className="flex-1" onPress={() => handleArticlePress("geological rocks")} activeOpacity={0.8}>
              <Image source={{ uri: "/placeholder.svg?height=120&width=160" }} className="w-full h-32 rounded-xl mb-2" resizeMode="cover" />
              <Text className="text-sm text-gray-700 leading-5">What are the type of geological rocks?</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1" onPress={() => handleArticlePress("rock formation")} activeOpacity={0.8}>
              <Image source={{ uri: "/placeholder.svg?height=120&width=160" }} className="w-full h-32 rounded-xl mb-2" resizeMode="cover" />
              <Text className="text-sm text-gray-700 leading-5">How do sedimentary rocks form?</Text>
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
