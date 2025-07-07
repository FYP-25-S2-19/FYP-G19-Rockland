import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import ArticleCard from "./ArticleCard"; // Adjust path if needed
import DiscussionCard from "./DiscussionCard";
import FilterModal from "./FilterModalFeed";
import FilterIcon from "../assets/images/filter.svg";
import SearchIcon from "../assets/images/search.svg";

type TabKey = "articles" | "discussions" | "rocks";

type BaseFeedProps = {
  userRole: string;
  articles: any[];
  discussions?: any[];
  rocks?: any[];
  tabs: { key: TabKey; label: string }[];
  onLikeToggle: (articleId: number) => void;
  onUpgradeRequest: (message: string) => void;
};

export default function BaseFeed({
  userRole,
  articles,
  discussions = [],
  rocks = [],
  tabs,
  onLikeToggle,
  onUpgradeRequest,
}: BaseFeedProps) {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0].key);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const filteredArticles = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return articles.filter(
      (article) =>
        typeof article.title === "string" &&
        article.title.toLowerCase().includes(keyword)
    );
  }, [articles, searchText]);

  const filteredDiscussions = useMemo(() => {
  const keyword = searchText.toLowerCase();
  return discussions.filter(
    (d) =>
      typeof d.text === "string" && d.text.toLowerCase().includes(keyword)
  );
}, [discussions, searchText]);

  const filteredRocks = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return rocks.filter(
      (r) => typeof r.name === "string" && r.name.toLowerCase().includes(keyword)
    );
  }, [rocks, searchText]);

  const handleTabPress = (tabKey: TabKey) => {
    const normalizedRole = userRole?.trim().toLowerCase() || "";
  
    if (
      normalizedRole === "free" &&
      (tabKey === "discussions" || tabKey === "rocks")
    ) {
      setUpgradeMessage("Premium Features Only\nUpgrade to unlock all features.");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tabKey);
  };

  const openArticle = (article: any) => {
    if (article.isPremium && userRole === "free") {
      setUpgradeMessage("Upgrade to Premium to open this article.");
      setShowUpgradeModal(true);
      return;
    }
    router.push(`/article/${article.id}`);
  };

  const openRock = (rock: any) => {
    router.push(`/viewrock/${rock.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12 mr-3 border-2 border-[#459B6C]">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="p-3 bg-white rounded-xl border-2 border-[#459B6C]"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around border-b border-gray-200 px-4 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handleTabPress(tab.key)}
            className="flex-1"
          >
            <View
              className="items-center pb-2 border-b-2"
              style={{
                borderBottomColor:
                  activeTab === tab.key ? "#459B6C" : "transparent",
              }}
            >
              <Text
                className={`text-base font-bold ${
                  activeTab === tab.key ? "text-black" : "text-gray-400"
                }`}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === "articles" && (
        <FlatList
          data={filteredArticles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onLikeToggle={() => onLikeToggle(item.id)}
              isPremiumUser={userRole === "premium"}
              onUpgrade={() => {
                setUpgradeMessage("Upgrade to Premium to open this article.");
                setShowUpgradeModal(true);
              }}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}


    {activeTab === "discussions" && (
    <FlatList
        data={filteredDiscussions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <DiscussionCard discussion={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
    />
    )}

      {activeTab === "rocks" && (
        <FlatList
          data={filteredRocks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openRock(item)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Image
                    source={item.image}
                    className="w-14 h-14 mr-4 rounded-md"
                  />
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.type} Rock
                    </Text>
                  </View>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      item.rarity === "Common"
                        ? "#6D6D6D"
                        : item.rarity === "Rare"
                        ? "#459B6C"
                        : "#EF9E1C",
                  }}
                >
                  <Text className="text-xs font-medium text-white">
                    {item.rarity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

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

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}
