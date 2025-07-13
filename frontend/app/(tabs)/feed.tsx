import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
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
  const API_URL = process.env.EXPO_PUBLIC_API_URL
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      const endpoint = getArticleEndpoint(userRole);
      if (!endpoint) return;
  
      try {
        const token = await AsyncStorage.getItem("accessToken"); // Assuming you stored JWT
        const response = await axios.get(`${API_URL}${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.success) {
          const fetchedArticles = response.data.articles.map((article: any) => ({
            id: article.article_id,
            title: article.title,
            preview: article.content?.slice(0, 100), // adjust preview logic
            category: article.category_title,
            authorName: article.author_name,
            authorImage: require("../../assets/images/profilepicture.png"), // fallback
            isPremium: !article.is_free,
            thumbnail: { uri: article.signed_photo_url || article.photo_url },
            likes: article.total_likes,
            liked: false, // default, until like API connected
          }));
          setArticles(fetchedArticles);
        } else {
          Alert.alert("Error", response.data.message);
        }
      } catch (err: any) {
        console.error("❌ Failed to fetch articles:", err.message);
        Alert.alert("Error", "Failed to fetch articles");
      }
    };

    const fetchDiscussions = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        console.log("📡 Fetching discussions with token:", token);
        console.log("🌐 Fetching from:", `${API_URL}/api/discussions`);
        const res = await fetch(`${API_URL}/api/discussions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) {
          setDiscussions(json.discussions);
        }
      } catch (e) {
        console.error("Failed to fetch discussions", e);
      }
    };

  
    if (userRole) {
      fetchArticles();
    fetchDiscussions();
    }
  }, [userRole]);

  const getArticleEndpoint = (role: string) => {
    if (role === "free" || role === "premium") {
      return "/api/articles/premium/view"; // unified endpoint
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