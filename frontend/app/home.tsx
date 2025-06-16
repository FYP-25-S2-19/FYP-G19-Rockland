import React, { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, ScrollView } from "react-native";
import BottomTabBar from "../components/BottomTabBar";
import CrownIcon from "../assets/images/crown.svg";
import SearchIcon from "../assets/images/search.svg";
import { sampleArticles } from "../data/article";

const graniteImg = require("../assets/images/granite.png");
const limestoneImg = require("../assets/images/limestone.png");
const basaltImg = require("../assets/images/basalt.png");
const quartziteImg = require("../assets/images/quartzite.png");

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleArticlePress = (article: string) => {
    console.log(`Article pressed: ${article}`);
  };

  const handleSearchClick = () => {
    router.push("/searchrock");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-5 pb-6">
          <Text className="text-4xl font-bold text-black mb-1">ROCKLAND</Text>
          <Text className="text-base font-bold text-green-500">#1 Rock Learning Platform</Text>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-5">
          <TouchableOpacity onPress={handleSearchClick} activeOpacity={0.8}>
            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 border border-gray-600">
              <SearchIcon width={24} height={24} style={{ marginRight: 10 }} />
              <Text className="text-base text-gray-400">Search rocks, minerals...</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Unlock Features */}
        <TouchableOpacity className="flex-row items-center bg-[#EF9E1C] mx-5 py-4 px-5 rounded-xl mb-5" activeOpacity={0.8}>
          <Text className="text-xl mr-3"><CrownIcon width={22} height={22} style={{ marginRight: 10 }} fill="white" /></Text>
          <Text className="flex-1 text-base font-semibold text-white">Tap to unlock full features</Text>
          <Text className="text-lg text-white">→</Text>
        </TouchableOpacity>

        {/* Take Quiz & Leaderboard */}
        <View className="flex-row px-5 mb-8">
          <TouchableOpacity className="flex-1 bg-green-600 py-4 rounded-xl items-center mr-1.5" activeOpacity={0.8}>
            <Text className="text-base font-semibold text-white">Take Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-green-600 py-4 rounded-xl items-center ml-1.5" activeOpacity={0.8}>
            <Text className="text-base font-semibold text-white">Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Popular on Rockland */}
        <View className="px-5 mb-3">
          <Text className="text-xl font-bold text-gray-900 mb-4">Popular on Rockland</Text>

          <View className="flex-row flex-wrap mb-3">
            {/* Granite */}
            <View className="flex-row w-full mb-3">
              <TouchableOpacity className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm mr-1.5" activeOpacity={0.8}>
                <Image source={graniteImg} className="w-full h-32" resizeMode="cover" />
                <View className="p-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Granite</Text>
                  <Text className="text-sm text-gray-500 mb-1">Igneous Rock</Text>
                  <Text className="text-sm text-gray-600">💬 128 Comments</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm ml-1.5" activeOpacity={0.8}>
                <Image source={limestoneImg} className="w-full h-32" resizeMode="cover" />
                <View className="p-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Limestone</Text>
                  <Text className="text-sm text-gray-500 mb-1">Sedimentary Rock</Text>
                  <Text className="text-sm text-gray-600">💬 102 Comments</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="flex-row w-full mb-3">
              <TouchableOpacity className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm mr-1.5" activeOpacity={0.8}>
                <Image source={basaltImg} className="w-full h-32" resizeMode="cover" />
                <View className="p-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Basalt</Text>
                  <Text className="text-sm text-gray-500 mb-1">Igneous Rock</Text>
                  <Text className="text-sm text-gray-600">💬 95 Comments</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm ml-1.5" activeOpacity={0.8}>
                <Image source={quartziteImg} className="w-full h-32" resizeMode="cover" />
                <View className="p-3">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">Quartzite</Text>
                  <Text className="text-sm text-gray-500 mb-1">Metamorphic Rock</Text>
                  <Text className="text-sm text-gray-600">💬 90 Comments</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Top Articles */}
        <View className="px-5 mb-10">
          <Text className="text-xl font-bold text-gray-900 mb-4">Top Articles</Text>
          {sampleArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              className="flex-row mb-4 bg-white rounded-xl overflow-hidden border border-gray-300 shadow-sm"
              activeOpacity={0.8}
              onPress={() => handleArticlePress(article.title)}
            >
              <Image source={article.thumbnail} className="w-28 h-28" resizeMode="cover" />
              <View className="flex-1 p-3 justify-center">
                <Text className="text-base font-semibold text-gray-900 mb-1">{article.title}</Text>
                <Text className="text-sm text-gray-500">{article.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Bottom Tab */}
      <BottomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}
