import React, { useState, useEffect } from "react";
import { Alert, ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BaseFeed from "../../components/BaseFeed";
import { sampleArticles } from "../../data/article";
import axios from "axios";

export default function FreePremiumFeed() {
  const [userRole, setUserRole] = useState<"free" | "premium">("free");
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState(
    sampleArticles.map((article) => ({ ...article, liked: false }))
  );
  const [discussions, setDiscussions] = useState([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const initializeUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        if (role === "premium") {
          setUserRole("premium");
        } else {
          setUserRole("free");
        }
      } catch (e) {
        console.error("⚠️ Failed to load user role:", e);
      }
    };

    const fetchArticles = async () => {
      const endpoint = getArticleEndpoint(userRole);
      if (!endpoint) return;

      try {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          const fetchedArticles = response.data.articles.map((article: any) => ({
            id: article.article_id,
            title: article.title,
            preview: article.content?.slice(0, 100),
            category: article.category_title,
            authorName: article.author_name,
            authorImage: require("../../assets/images/profilepicture.png"),
            isPremium: !article.is_free,
            thumbnail: { uri: article.signed_photo_url || article.photo_url },
            likes: article.total_likes,
            liked: false,
          }));
          setArticles(fetchedArticles);
        } else {
          Alert.alert("Error", response.data.message || "Failed to load articles");
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch articles:", err.message);
        Alert.alert("Error", "Failed to fetch articles");
      }
    };

    const fetchDiscussions = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        console.log("📡 Fetching discussions from:", `${API_URL}/api/discussions`);
        const res = await fetch(`${API_URL}/api/discussions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setDiscussions(json.discussions);
        } else {
          console.warn("⚠️ Failed to load discussions:", json.message);
        }
      } catch (e) {
        console.error("❌ Failed to fetch discussions", e);
      }
    };

    const initialize = async () => {
      setLoading(true);
      await initializeUserRole();
      await Promise.all([fetchArticles(), fetchDiscussions()]);
      setLoading(false);
    };

    initialize();
  }, [userRole]);

  const getArticleEndpoint = (role: string) => {
    if (role === "free" || role === "premium") {
      return "/api/articles/premium/view";
    }
    return "";
  };

  const onLikeToggle = (articleId: number) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a
      )
    );
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
      onUpgradeRequest={(message) => Alert.alert("Upgrade Needed", message)}
    />
  );
}
