import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BaseFeed from "../../components/BaseFeed";
import { sampleArticles } from "../../data/article";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FreePremiumFeed() {
  const [userRole, setUserRole] = useState<"free" | "premium">("free");
  const [articles, setArticles] = useState(
    sampleArticles.map((article) => ({ ...article, liked: false }))
  );
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem("userRole");
        if (storedRole === "premium" || storedRole === "free") {
          setUserRole(storedRole);
        }
      } catch (e) {
        console.error("Failed to load user role from AsyncStorage", e);
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

    loadUserRole();
    fetchDiscussions();
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