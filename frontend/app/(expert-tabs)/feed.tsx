// app/screens/ExpertFeed.tsx

import React, { useState, useEffect } from "react";
import { View, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BaseFeed from "../../components/BaseFeed";
import { timeAgo } from "../../utils/timeAgo";
import EventBus from "../../utils/eventBus";
import debounce from "lodash.debounce";

export default function ExpertFeed() {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [rocks, setRocks] = useState<any[]>([]);
  

  // Filters
  const [searchText, setSearchText] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Sort by A-Z");
  const [searchQuery, setSearchQuery] = useState("");
  const [discussionSort, setDiscussionSort] = useState<"asc" | "desc" | "rec">("desc");
  const [discussionCategoryId, setDiscussionCategoryId] = useState<number | null>(null);

  const fetchArticles = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const articleRes = await axios.get(`${API_URL}/api/articles/all`, { headers });

      if (articleRes.data.success) {
        const fetchedArticles = articleRes.data.articles.map((article: any) => ({
          id: article.article_id,
          title: article.title,
          preview: article.content?.slice(0, 100),
          category: article.category_title,
          authorName: article.author_name,
          authorImage: article.author_profile_picture
            ? { uri: article.author_profile_picture }
            : require("../../assets/images/profilepicture.png"),
          isPremium: !article.is_free,
          thumbnail: { uri: article.signed_photo_url || article.photo_url },
          likes: article.total_likes,
          liked: !!article.liked_by_user,
          timeAgo: timeAgo(new Date(article.date_created)),
        }));
        setArticles(fetchedArticles);
      } else {
        Alert.alert("Error", articleRes.data.message || "Failed to load articles");
      }
    } catch (err) {
      console.error("❌ Error fetching articles:", err);
      Alert.alert("Error", "Failed to load articles.");
    }
  };

  const fetchRocks = async () => {
    try {
      const params: any = {};
      if (searchText) params.rock_name = searchText;
      if (selectedTypes.length) params.rock_type = selectedTypes;
      if (selectedRarities.length) params.rarity = selectedRarities;
      if (selectedLocations.length) params.location = selectedLocations;

      switch (sortBy) {
        case "Sort by A-Z":
          params.sort_by = "az";
          break;
        case "Sort by Z-A":
          params.sort_by = "za";
          break;
        case "Sort by Most Commented":
          params.sort_by = "most_commented";
          break;
        case "Sort by Rarity":
          params.sort_by = "rarity";
          break;
        default:
          params.sort_by = "";
      }

      const res = await axios.get(`${API_URL}/api/rocks/search`, { params });
      if (res.data.success) {
        setRocks(res.data.rocks);
      }
    } catch (err) {
      console.error("❌ Error fetching rocks:", err);
      Alert.alert("Error", "Failed to load rock entries.");
    }
  };

  const initialize = async () => {
    setLoading(true);
    await fetchArticles();
    await fetchRocks();
    setLoading(false);
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const debounced = debounce(() => fetchRocks(), 500);
    debounced();
    return () => debounced.cancel();
  }, [searchText, selectedTypes, selectedRarities, selectedLocations, sortBy]);

  const onLikeToggle = async (articleId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const article = articles.find((a) => a.id === articleId);
      if (!article) return;

      const method = article.liked ? "DELETE" : "POST";
      const url = `${API_URL}/api/articles/${articleId}/${article.liked ? "unlike" : "like"}`;

      const res = await fetch(url, { method, headers });
      const json = await res.json();

      if (json.success) {
        const newLiked = !article.liked;
        const newLikes = article.likes + (newLiked ? 1 : -1);
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, liked: newLiked, likes: newLikes } : a
          )
        );
      } else {
        Alert.alert("Error", json.message || "Failed to update like");
      }
    } catch (err) {
      console.error("❌ Error toggling like:", err);
      Alert.alert("Error", "Failed to toggle like.");
    }
  };

  useEffect(() => {
    const handleArticleLikeUpdated = (data: {
      articleId: number;
      liked: boolean;
      likeCount: number;
    }) => {
      const { articleId, liked, likeCount } = data;
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, liked, likes: likeCount } : a
        )
      );
    };

    EventBus.on("articleLikeUpdated", handleArticleLikeUpdated);
    return () => EventBus.off("articleLikeUpdated", handleArticleLikeUpdated);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
      </View>
    );
  }

  return (
    <BaseFeed
  userRole="expert"
  articles={articles}
  rocks={rocks}
  tabs={[
    { key: "articles", label: "Articles" },
    { key: "rocks", label: "Rock Entries" },
  ]}
  onLikeToggle={onLikeToggle}
  onUpgradeRequest={(msg) => Alert.alert("Upgrade", msg)}
  updateArticleLike={(articleId, liked, likeCount) =>
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, liked, likes: likeCount } : a)),
    )
  }
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  discussionSort={discussionSort}
  setDiscussionSort={setDiscussionSort}
  discussionCategoryId={discussionCategoryId}
  setDiscussionCategoryId={setDiscussionCategoryId}
  rockSearchOptions={{
    searchText,
    selectedTypes,
    selectedRarities,
    selectedLocations,
    sortBy,
    setSearchText,
    setSelectedTypes,
    setSelectedRarities,
    setSelectedLocations,
    setSortBy,
  }}
/>

  );
}
