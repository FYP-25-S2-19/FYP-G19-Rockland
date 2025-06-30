import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTabBar from "../components/BottomTabBar";
import CrownIcon from "../assets/images/crown.svg";
import SearchIcon from "../assets/images/search.svg";
import ArrowRightIcon from "../assets/images/arrow_right.svg";
import { sampleArticles } from "../data/article";

const graniteImg = require("../assets/images/granite.png");
const limestoneImg = require("../assets/images/limestone.png");
const basaltImg = require("../assets/images/basalt.png");
const quartziteImg = require("../assets/images/quartzite.png");

export default function HomeScreen() {
  const [role, setRole] = useState("free");
  const router = useRouter();

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      if (storedRole) setRole(storedRole);
    };
    loadRole();
  }, []);

  const handleArticlePress = (article: string) => {
    console.log(`Article pressed: ${article}`);
  };

  const handleSearchClick = () => {
    router.push("/searchrock");
  };

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  };

  return (
    <SafeAreaView className="flex-1 bg-green-100">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-6 pb-4">
          <Text className="text-4xl font-bold text-green-800">ROCKLAND</Text>
          <Text className="text-base font-semibold text-green-600 mt-1">
            #1 Rock Learning Platform
          </Text>
        </View>

        {/* Search */}
        <View className="px-5 mb-6">
          <TouchableOpacity
            onPress={handleSearchClick}
            activeOpacity={0.85}
            style={[shadowStyle]}
          >
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border-2 border-[#459B6C]">
              <SearchIcon width={22} height={22} style={{ marginRight: 10 }} />
              <Text className="text-base text-gray-400">
                Search rocks, minerals...
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Unlock Features (Free Only) */}
        {role === "free" && (
          <TouchableOpacity
            className="flex-row items-center bg-[#EF9E1C] mx-5 py-4 px-5 rounded-2xl mb-6"
            activeOpacity={0.85}
            style={shadowStyle}
          >
            <Text className="text-xl mr-3">
              <CrownIcon
                width={22}
                height={22}
                style={[{ marginRight: 10 }, shadowStyle]}
                fill="white"
              />
            </Text>
            <Text className="flex-1 text-base font-semibold text-white">
              Tap to unlock full features
            </Text>
            <ArrowRightIcon width={18} height={18} fill="white" />
          </TouchableOpacity>
        )}

        {/* Take Quiz / Leaderboard */}
        <View className="flex-row px-5 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/quiz")}
            className="flex-1 bg-[#459B6C] py-4 rounded-2xl items-center mr-2"
            activeOpacity={0.85}
            style={shadowStyle}
          >
            <Text className="text-base font-semibold text-white">Take Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/leaderboard")}
            className="flex-1 bg-white py-4 rounded-2xl items-center ml-2 border-2 border-[#459B6C]"
            activeOpacity={0.85}
            style={shadowStyle}
          >
            <Text className="text-base font-semibold text-[#459B6C]">
              Leaderboard
            </Text>
          </TouchableOpacity>
        </View>

        {/* Popular Section */}
        <View className="px-5 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Popular on Rockland
          </Text>

          <View className="space-y-4">
            {/* Row 1 */}
            <View className="flex-row">
              {[{ name: "Granite", img: graniteImg, type: "Igneous Rock", comments: "128" },
                { name: "Limestone", img: limestoneImg, type: "Sedimentary Rock", comments: "102" }]
                .map((item, index) => (
                  <TouchableOpacity
                    key={item.name}
                    className={`flex-1 bg-white rounded-2xl border border-[#459B6C] ${
                      index === 0 ? "mr-2" : "ml-2"
                    }`}
                    activeOpacity={0.85}
                    style={shadowStyle}
                  >
                    <Image
                      source={item.img}
                      className="w-full h-32 rounded-t-2xl"
                      resizeMode="cover"
                    />
                    <View className="p-3">
                      <Text className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.type}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        💬 {item.comments} Comments
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>

            {/* Row 2 */}
            <View className="flex-row mt-4">
              {[{ name: "Basalt", img: basaltImg, type: "Igneous Rock", comments: "95" },
                { name: "Quartzite", img: quartziteImg, type: "Metamorphic Rock", comments: "90" }]
                .map((item, index) => (
                  <TouchableOpacity
                    key={item.name}
                    className={`flex-1 bg-white rounded-2xl border border-[#459B6C] ${
                      index === 0 ? "mr-2" : "ml-2"
                    }`}
                    activeOpacity={0.85}
                    style={shadowStyle}
                  >
                    <Image
                      source={item.img}
                      className="w-full h-32 rounded-t-2xl"
                      resizeMode="cover"
                    />
                    <View className="p-3">
                      <Text className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.type}
                      </Text>
                      <Text className="text-sm text-gray-600">
                        💬 {item.comments} Comments
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        </View>

        {/* Top Articles */}
        <View className="px-5 mb-20">
          <Text className="text-xl font-bold text-gray-900 mb-4">Top Articles</Text>
          {sampleArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              className="flex-row mb-4 bg-white rounded-2xl border border-gray-200"
              activeOpacity={0.85}
              style={shadowStyle}
              onPress={() => handleArticlePress(article.title)}
            >
              <Image
                source={article.thumbnail}
                className="w-28 h-28 rounded-l-2xl"
                resizeMode="cover"
              />
              <View className="flex-1 p-3 justify-center">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {article.title}
                </Text>
                <Text className="text-sm text-gray-500">{article.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Home" />
    </SafeAreaView>
  );
}