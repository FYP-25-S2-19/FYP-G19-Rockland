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
    const initialize = async () => {
      setLoading(true);
      try {
        // Load role
        const role = await AsyncStorage.getItem("userRole");
        setUserRole(role === "premium" ? "premium" : "free");

        const token = await AsyncStorage.getItem("accessToken");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch articles
        const articleRes = await axios.get(`${API_URL}/api/articles/all`, {
          headers,
        });

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
            liked: false,
            timeAgo: article.date_created, // ✅ add this
          }));
          setArticles(fetchedArticles);
        } else {
          Alert.alert("Error", articleRes.data.message || "Failed to load articles");
        }

        // Fetch discussions
        const discussionRes = await fetch(`${API_URL}/api/discussions`, { headers });
        const discussionJson = await discussionRes.json();

        if (discussionJson.success) {
          setDiscussions(discussionJson.discussions);
        } else {
          console.warn("⚠️ Failed to load discussions:", discussionJson.message);
        }

      } catch (e) {
        console.error("❌ Error initializing feed:", e);
        Alert.alert("Error", "Something went wrong while loading content.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

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
