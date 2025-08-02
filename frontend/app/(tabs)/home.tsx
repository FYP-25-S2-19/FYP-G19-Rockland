import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomTabBar from "../../components/BottomTabBar";
import CrownIcon from "../../assets/images/crown.svg";
import SearchIcon from "../../assets/images/search.svg";
import ArrowRightIcon from "../../assets/images/arrow_right.svg";
import LikeIcon from "../../assets/images/like.svg";
import { LinearGradient } from "expo-linear-gradient";

// ...imports unchanged
export default function HomeScreen() {
  const [role, setRole] = useState("free");
  const router = useRouter();
  const [topRocks, setTopRocks] = useState<any[]>([]);
  const [loadingRocks, setLoadingRocks] = useState(true);
  const [recommendedArticles, setRecommendedArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const storedRole = await AsyncStorage.getItem("userRole");
      if (storedRole) setRole(storedRole);

      try {
        const token = await AsyncStorage.getItem("accessToken");

        // 🪨 Rocks
        const rockRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/rocks/top-commented`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rockData = await rockRes.json();
        if (rockData.success) setTopRocks(rockData.rocks);

        // 📚 Articles by interest + likes
        const articleRes = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/api/articles/by-user-interest?sort=interest-then-likes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const articleData = await articleRes.json();
        if (articleData.success) setRecommendedArticles(articleData.articles);
      } catch (err) {
        console.error("⚠️ Error fetching home data:", err);
      } finally {
        setLoadingRocks(false);
        setLoadingArticles(false);
      }
    };

    loadData();
  }, []);

  const handleArticlePress = (article: any) => {
    if (article.is_free || role === "premium") {
      router.push({
        pathname: "/article/[id]",
        params: { id: String(article.article_id) },
      });
    } else {
      setUpgradeMessage("Upgrade to Premium to view this article.");
      setShowUpgradeModal(true);
    }
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
    <LinearGradient
      colors={["#91D29E", "#FFFFFF"]}
      start={{ x: -1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-transparent">
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
            <TouchableOpacity onPress={handleSearchClick} activeOpacity={0.85}>
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-3" style={shadowStyle}>
                <SearchIcon width={22} height={22} style={{ marginRight: 10 }} />
                <Text className="text-base text-gray-400">Search rocks, minerals...</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Unlock Features (Free Only) */}
          {role === "free" && (
            <TouchableOpacity
              className="flex-row items-center bg-[#EF9E1C] mx-5 py-4 px-5 rounded-2xl mb-6"
              activeOpacity={0.85}
              style={shadowStyle}
              onPress={() => router.push("/subscribe-premium")}
            >
              <Text className="text-xl mr-3">
                <CrownIcon width={22} height={22} style={{ marginRight: 10 }} fill="white" />
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
              <Text className="text-base font-semibold text-[#459B6C]">Leaderboard</Text>
            </TouchableOpacity>
          </View>

          {/* Top Rocks */}
          <View className="px-5 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Popular on Rockland</Text>

            {loadingRocks ? (
              <Text className="text-base text-gray-500">Loading...</Text>
            ) : topRocks.length === 0 ? (
              <Text className="text-base text-gray-500">No rocks found.</Text>
            ) : (
              [0, 1].map((rowIndex) => (
                <View className="flex-row mt-2" key={`row-${rowIndex}`}>
                  {topRocks
                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                    .map((rock, index) => (
                      <TouchableOpacity
                        key={rock.rock_id}
                        className={`flex-1 bg-white rounded-2xl ${index === 0 ? "mr-2" : "ml-2"}`}
                        activeOpacity={0.85}
                        onPress={() => router.push(`/viewrock/${rock.rock_id}`)}
                        style={shadowStyle}
                      >
                        <Image
                          source={{ uri: rock.signed_url }}
                          className="w-full h-32 rounded-t-2xl"
                          resizeMode="cover"
                        />
                        <View className="p-3">
                          <Text className="text-lg font-semibold text-gray-900">{rock.rock_name}</Text>
                          <Text className="text-sm text-gray-500">{rock.rock_type}</Text>
                          <Text className="text-sm text-gray-600">
                            💬 {rock.comment_count ?? 0} Comments
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              ))
            )}
          </View>

          {/* Recommended Articles */}
          <View className="px-5 mb-20">
            <Text className="text-xl font-bold text-gray-900 mb-4">Recommended for You</Text>
            {loadingArticles ? (
              <Text className="text-base text-gray-500">Loading...</Text>
            ) : recommendedArticles.length === 0 ? (
              <Text className="text-base text-gray-500">No articles found.</Text>
            ) : (
              recommendedArticles.map((article) => (
                <TouchableOpacity
                  key={article.article_id}
                  className="flex-row mb-4 bg-white rounded-2xl border border-gray-200"
                  activeOpacity={0.85}
                  style={shadowStyle}
                  onPress={() => handleArticlePress(article)}
                >
                  {article.signed_photo_url ? (
                    <Image
                      source={{ uri: article.signed_photo_url }}
                      className="w-28 h-28 rounded-l-2xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-28 h-28 rounded-l-2xl bg-gray-200 justify-center items-center">
                      <Text className="text-xs text-gray-500">No Image</Text>
                    </View>
                  )}
                  <View className="flex-1 p-3 justify-between">
                    <Text
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full self-start mb-1 ${
                        article.is_free
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {article.is_free ? "Free" : "Premium"}
                    </Text>
                    <View>
                      <Text className="text-base font-semibold text-gray-900 mb-1">
                        {article.title}
                      </Text>
                      <Text className="text-sm text-gray-500">{article.category_title}</Text>
                    </View>
                    <View className="flex-row justify-end items-center space-x-4">
                      <Text className="text-xs text-gray-500">
                        {article.like_count ?? 0} Likes
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Upgrade Modal */}
          <Modal
            visible={showUpgradeModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowUpgradeModal(false)}
          >
            <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
              <View className="bg-white p-6 rounded-xl w-80">
                <Text className="text-lg font-bold mb-4">Premium Feature</Text>
                <Text className="text-sm mb-6 text-center">{upgradeMessage}</Text>
                <Pressable
                  className="bg-black py-3 rounded-xl"
                  onPress={() => setShowUpgradeModal(false)}
                >
                  <Text className="text-white text-center font-semibold">OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
