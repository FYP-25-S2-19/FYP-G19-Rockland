import React, { useEffect, useState, useMemo } from "react";
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
import ArticleCard from "./ArticleCard";
import DiscussionCard from "./DiscussionCard";
import FilterModal from "./FilterModalFeed";
import FilterModalRock from "./FilterModalRock";
import FilterModalDiscussion from "./FilterModalDiscussion";

import FilterIcon from "../assets/images/filter.svg";
import SearchIcon from "../assets/images/search.svg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TabKey = "articles" | "discussions" | "rocks";

type BaseFeedProps = {
  userRole: string;
  articles: any[];
  discussions?: any[];
  rocks?: any[];
  tabs: { key: TabKey; label: string }[];
  onLikeToggle: (articleId: number) => void;
  onUpgradeRequest: (message: string) => void;
  updateArticleLike: (articleId: number, liked: boolean, likeCount: number) => void;
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  discussionSort: "asc" | "desc" | "rec";
  setDiscussionSort: (sort: "asc" | "desc" | "rec") => void;
  discussionCategoryId: number | null;
  setDiscussionCategoryId: (id: number | null) => void;
  rockSearchOptions?: {
    searchText: string;
    selectedTypes: string[];
    selectedRarities: string[];
    selectedLocations: string[];
    sortBy: string;
    setSearchText: (text: string) => void;
    setSelectedTypes: (types: string[]) => void;
    setSelectedRarities: (rarities: string[]) => void;
    setSelectedLocations: (locations: string[]) => void;
    setSortBy: (sort: string) => void;
  };
};

export default function BaseFeed({
  userRole,
  articles: incomingArticles,
  discussions = [],
  rocks = [],
  tabs,
  onLikeToggle,
  onUpgradeRequest,
  updateArticleLike,
  searchQuery,
  setSearchQuery,
  discussionSort,
  setDiscussionSort,
  discussionCategoryId,
  setDiscussionCategoryId,
  rockSearchOptions,
}: BaseFeedProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0].key);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [discussionModalVisible, setDiscussionModalVisible] = useState(false);
  const [articles, setArticles] = useState(incomingArticles);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Sort by Most Liked");
  const [forceRefresh, setForceRefresh] = useState(false);

  const handleUpdateLike = (
    articleId: number,
    liked: boolean,
    likeCount: number
  ) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, liked, likes: likeCount } : a))
    );
    updateArticleLike(articleId, liked, likeCount);
  };

  const fetchArticles = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        search_term: searchQuery,
        selectedCategories,
        sort_by: sortBy,
      };
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/articles/search`,
        payload,
        { headers }
      );
      if (response.data.success) {
        const fetched = response.data.articles.map((article: any) => {
          const prev = incomingArticles.find((a) => a.id === article.article_id);
          return {
            id: article.article_id,
            title: article.title,
            preview: article.content?.slice(0, 100),
            category: article.category_title,
            authorName: article.author_name,
            authorImage: article.author_profile_picture
              ? { uri: article.author_profile_picture }
              : require("../assets/images/profilepicture.png"),
            isPremium: !article.is_free,
            thumbnail: { uri: article.signed_photo_url || article.photo_url },
            likes: article.total_likes,
            liked: !!article.liked_by_user,
            timeAgo: article.date_created
              ? require("../utils/timeAgo").timeAgo(new Date(article.date_created))
              : "",
            isRecommended: article.is_recommended ?? prev?.isRecommended ?? false,
          };
        });
        setArticles(fetched);
      }
    } catch (e) {
      console.error("❌ Failed to search articles:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "articles") {
      fetchArticles();
    }
  }, [searchQuery, selectedCategories, sortBy, forceRefresh, activeTab]);

  // Rocks (unchanged)
  const filteredRocks = useMemo(() => {
    if (!rockSearchOptions) return rocks;
    const kw = (rockSearchOptions.searchText || "").toLowerCase();
    return rocks.filter((r) =>
      `${r.rock_name ?? r.name ?? ""} ${r.rock_type ?? r.type ?? ""}`
        .toLowerCase()
        .includes(kw)
    );
  }, [rocks, rockSearchOptions?.searchText]);

  const handleTabPress = (tabKey: TabKey) => {
    if (userRole.trim().toLowerCase() === "free" && tabKey !== "articles") {
      setUpgradeMessage("Premium Features Only\nUpgrade to unlock all features.");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab(tabKey);
    if (tabKey === "discussions") {
      setForceRefresh((prev) => !prev);
    }
  };

  const openRock = (rock: any) => {
    router.push({
      pathname: "/viewrock/[id]",
      params: { id: rock.rock_id ?? rock.id },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search + Filter Row */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12 mr-3 border-2 border-[#459B6C]">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#9ca3af"
            value={
              activeTab === "rocks"
                ? (rockSearchOptions?.searchText ?? "")
                : searchQuery
            }
            onChangeText={(text) =>
              activeTab === "rocks"
                ? rockSearchOptions?.setSearchText?.(text)
                : setSearchQuery(text)
            }
          />
        </View>

        <TouchableOpacity
          onPress={() => {
            if (activeTab === "discussions") {
              setDiscussionModalVisible(true); // open discussions filter (sort + category, includes Recommended)
            } else {
              setFilterModalVisible(true);
            }
          }}
          className="p-3 bg-white rounded-xl border-2 border-[#459B6C]"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around border-b border-gray-200 px-4 mb-4">
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.key} onPress={() => handleTabPress(tab.key)} className="flex-1">
            <View
              className="items-center pb-2 border-b-2"
              style={{
                borderBottomColor: activeTab === tab.key ? "#459B6C" : "transparent",
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

      {/* Articles */}
      {activeTab === "articles" &&
        (articles.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-20">
            <Text className="text-gray-400 text-center text-base">
              No articles found for your search or filters.
            </Text>
          </View>
        ) : (
          <FlatList
            data={articles}
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
                updateLikeState={(liked, likeCount) =>
                  handleUpdateLike(item.id, liked, likeCount)
                }
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        ))}

      {/* Discussions (server-filtered results directly) */}
      {activeTab === "discussions" && (
        <>
          {(!discussions || discussions.length === 0) ? (
            <View className="flex-1 items-center justify-center px-6 mt-20">
              <Text className="text-gray-400 text-center text-base">
                No discussions found for your current search/sort.
              </Text>
            </View>
          ) : (
            <FlatList
              data={discussions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <DiscussionCard discussion={item} />}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View className="px-4 pb-5">
            <TouchableOpacity
              className="bg-green-600 rounded-full px-4 py-3"
              onPress={() => router.push("/creatediscussion")}
            >
              <Text className="text-white text-center font-semibold">
                Start a New Discussion
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Rocks */}
      {activeTab === "rocks" && (
        <FlatList
          data={filteredRocks}
          keyExtractor={(item) => (item.rock_id ?? item.id).toString()}
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
                    source={
                      item.signed_url
                        ? { uri: item.signed_url }
                        : item.image ?? require("../assets/images/picture.png")
                    }
                    className="w-14 h-14 mr-4 rounded-md"
                  />
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.rock_name ?? item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.rock_type ?? item.type}
                    </Text>
                  </View>
                </View>

                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      item.rarity?.toLowerCase() === "common"
                        ? "#6D6D6D"
                        : item.rarity?.toLowerCase() === "rare"
                        ? "#459B6C"
                        : "#EF9E1C",
                  }}
                >
                  <Text className="text-xs font-medium text-white">
                    {(item.rarity ?? "").charAt(0).toUpperCase() +
                      (item.rarity ?? "").slice(1)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Premium upsell modal */}
      <Modal
        visible={showUpgradeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
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

      {/* Articles filter modal */}
      {activeTab === "articles" && (
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          defaultValues={{ selectedCategories, sortBy }}
          onApply={({ selectedCategories, sortBy }) => {
            setSelectedCategories(selectedCategories);
            setSortBy(sortBy);
            setFilterModalVisible(false);
            setForceRefresh((prev) => !prev);
          }}
        />
      )}

      {/* Discussions filter (sort + category + Recommended) */}
      {activeTab === "discussions" && (
        <FilterModalDiscussion
          visible={discussionModalVisible}
          onClose={() => setDiscussionModalVisible(false)}
          currentSort={discussionSort}
          selectedCategoryId={discussionCategoryId}
          onApply={(sort, categoryId) => {
            setDiscussionSort(sort);
            setDiscussionCategoryId(categoryId);
          }}
        />
      )}

      {/* Rocks filter modal */}
      {activeTab === "rocks" && rockSearchOptions && (
        <FilterModalRock
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          defaultValues={{
            types: rockSearchOptions.selectedTypes,
            rarities: rockSearchOptions.selectedRarities,
            locations: rockSearchOptions.selectedLocations,
            sortOption: rockSearchOptions.sortBy,
          }}
          onApply={({ types, rarities, locations, sortOption }) => {
            rockSearchOptions.setSelectedTypes(types);
            rockSearchOptions.setSelectedRarities(rarities);
            rockSearchOptions.setSelectedLocations(locations);
            rockSearchOptions.setSortBy(sortOption);
            setFilterModalVisible(false);
          }}
        />
      )}
    </SafeAreaView>
  );
}
