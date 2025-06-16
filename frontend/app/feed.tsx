import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ArticleCard from "../components/ArticleCard";
import DiscussionCard from "../components/DiscussionCard";
import FilterModal from "../components/FilterModal";
import BottomTabBar from "../components/BottomTabBar";
import CrownIcon from "../assets/images/crown.svg";
import FilterIcon from "../assets/images/filter.svg";
import SearchIcon from "../assets/images/search.svg";
import { sampleArticles } from "../data/article";
import { sampleDiscussions } from "../data/discussion";

export default function FeedScreen() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"Articles" | "Discussions">("Articles");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [articles, setArticles] = useState(
    sampleArticles.map((article) => ({ ...article, liked: false }))
  );

  // Load role from AsyncStorage
  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role);
    };
    loadRole();
  }, []);

  const handleLikeToggle = (articleId: number) => {
    setArticles((prevArticles) =>
      prevArticles.map((article) => {
        if (article.id === articleId) {
          const liked = !article.liked;
          const likes = liked ? article.likes + 1 : article.likes - 1;
          return { ...article, liked, likes };
        }
        return article;
      })
    );
  };

  const filteredArticles = articles.filter((article) => {
    const keyword = searchText.toLowerCase();
    return (
      article.title.toLowerCase().includes(keyword) ||
      article.preview.toLowerCase().includes(keyword) ||
      article.category.toLowerCase().includes(keyword) ||
      article.authorName.toLowerCase().includes(keyword)
    );
  });

  const handleTabPress = (tab: "Articles" | "Discussions") => {
    if (tab === "Discussions" && userRole === "free") {
      setUpgradeMessage("Premium Features Only\nUpgrade to unlock all the features.");
      setShowUpgradeModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const openArticleUpgrade = (isPremium: boolean) => {
    if (isPremium && userRole === "free") {
      setUpgradeMessage("Upgrade to Premium to open this article.");
      setShowUpgradeModal(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mr-3 border border-gray-600">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800 p-0"
            style={{ paddingVertical: 0 }}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="p-3 bg-gray-100 rounded-xl border border-gray-600"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around border-b border-gray-200 pb-2 mb-2">
        <TouchableOpacity onPress={() => handleTabPress("Articles")}>
          <Text className={`text-base font-semibold ${activeTab === "Articles" ? "text-black border-b-2 border-black pb-1" : "text-gray-400"}`}>
            Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleTabPress("Discussions")}>
          <Text className={`text-base font-semibold ${activeTab === "Discussions" ? "text-black border-b-2 border-black pb-1" : "text-gray-400"}`}>
            Discussions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Premium Banner (only for free user) */}
      {userRole === "free" && (
        <TouchableOpacity className="flex-row bg-[#EF9E1C] mx-4 p-4 rounded-xl mb-4 items-center">
          <CrownIcon width={22} height={22} style={{ marginRight: 10 }} fill="white" />
          <Text className="flex-1 text-base font-semibold text-white">
            Subscribe Now to Unlock Full Articles
          </Text>
          <Text className="text-lg text-white">→</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {activeTab === "Articles" ? (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onLikeToggle={() => handleLikeToggle(item.id)}
              isPremiumUser={userRole === "premium"}
              onUpgrade={() => openArticleUpgrade(item.isPremium)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <FlatList
            data={sampleDiscussions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <DiscussionCard discussion={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          />
        </View>
      )}

      <BottomTabBar activeTab="Feed" />
      <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />

      {/* Shared Upgrade Modal */}
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
            <Pressable className="bg-black py-3 rounded-xl" onPress={() => setShowUpgradeModal(false)}>
              <Text className="text-white text-center font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
