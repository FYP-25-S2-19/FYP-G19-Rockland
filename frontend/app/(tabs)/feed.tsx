import React, { useState, useEffect } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BaseFeed from "../../components/BaseFeed";
import { timeAgo } from "../../utils/timeAgo";
import EventBus from "../../utils/eventBus";

export default function FreePremiumFeed() {
  const [userRole, setUserRole] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // desc=newest, asc=oldest, rec=recommended
  const [discussionSort, setDiscussionSort] = useState<"desc" | "asc" | "rec">("desc");
  const [discussionCategoryId, setDiscussionCategoryId] = useState<number | null>(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const fetchDiscussions = async ({
    headers,
    sortBy,
    q,
    categoryId,
  }: {
    headers: Record<string, string>;
    sortBy: "newest" | "oldest" | "recommended";
    q?: string;
    categoryId?: number | null;
  }) => {
    const params = new URLSearchParams();
    params.set("sort_by", sortBy);
    if (q && q.trim()) params.set("q", q.trim());
    if (categoryId) params.set("category_ids", String(categoryId));

    const res = await fetch(`${API_URL}/api/discussions/search?${params.toString()}`, { headers });
    const json = await res.json();
    if (json.success) {
      setDiscussions(json.results || []);
    } else {
      console.warn("⚠️ Failed to load discussions:", json.message);
      setDiscussions([]);
    }
  };

  const initialize = async () => {
    setLoading(true);
    try {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole(role === "premium" ? "premium" : "free");

      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Articles (unchanged)
      const articleRes = await axios.get(`${API_URL}/api/articles/feed-hybrid`, { headers });
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
          isRecommended: article.is_recommended ?? false,
        }));
        setArticles(fetchedArticles);
      } else {
        Alert.alert("Error", articleRes.data.message || "Failed to load articles");
      }

      // Discussions (server-side search/sort/category/recommended)
      await fetchDiscussions({
        headers,
        sortBy: discussionSort === "asc" ? "oldest" : discussionSort === "rec" ? "recommended" : "newest",
        q: searchQuery,
        categoryId: discussionCategoryId,
      });
    } catch (e) {
      console.error("❌ Error initializing feed:", e);
      Alert.alert("Error", "Something went wrong while loading content.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch discussions when search/sort/category changes
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };
        await fetchDiscussions({
          headers,
          sortBy: discussionSort === "asc" ? "oldest" : discussionSort === "rec" ? "recommended" : "newest",
          q: searchQuery,
          categoryId: discussionCategoryId,
        });
      } catch (e) {
        console.error("❌ Error updating discussions:", e);
      }
    })();
  }, [searchQuery, discussionSort, discussionCategoryId]);

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
    return () => {
      EventBus.off("articleLikeUpdated", handleArticleLikeUpdated);
    };
  }, []);

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
    } catch (e) {
      console.error("❌ Error toggling like:", e);
      Alert.alert("Error", "Failed to toggle like.");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
      </View>
    );
  }

  return (
    <BaseFeed
      userRole={userRole}
      articles={articles}
      discussions={discussions}
      tabs={[
        { key: "articles", label: "Articles" },
        { key: "discussions", label: "Discussions" },
      ]}
      onLikeToggle={onLikeToggle}
      updateArticleLike={(articleId, liked, likeCount) => {
        setArticles((prev) =>
          prev.map((a) =>
            a.id === articleId ? { ...a, liked, likes: likeCount } : a
          )
        );
      }}
      onUpgradeRequest={(message) => Alert.alert("Upgrade Needed", message)}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      discussionSort={discussionSort}
      setDiscussionSort={setDiscussionSort}
      discussionCategoryId={discussionCategoryId}
      setDiscussionCategoryId={setDiscussionCategoryId}
    />
  );
}
