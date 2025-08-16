import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import SearchIcon from "../../assets/images/search.svg";
import BackIcon from "../../assets/images/back.svg";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AllArticlesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token) {
        console.warn("⚠️ No accessToken found");
        return;
      }

      let url = "";

      if (userId) {
        url = `${process.env.EXPO_PUBLIC_API_URL}/api/articles/author/${userId}`;
        console.log("📡 Fetching all articles by author:", userId);
      } else {
        url = `${process.env.EXPO_PUBLIC_API_URL}/api/articles/my_recent`;
        console.log("📡 Fallback: fetching recent articles via /my_recent");
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.articles) {
        setArticles(response.data.articles);
        console.log(`✅ Loaded ${response.data.articles.length} articles`);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("❌ Error fetching articles:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView className="flex-1 bg-white px-5">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="pr-3 py-1">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-[30px] font-bold text-black">My Articles</Text>
      </View>

      <View className="mb-5">
        <View className="flex-row items-center bg-white rounded-xl border-2 border-black px-4 h-12">
          <SearchIcon width={20} height={20} className="mr-2" />
          <TextInput
            className="flex-1 text-base text-black p-0"
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" className="mt-10" />
      ) : filteredArticles.length === 0 ? (
        <Text className="text-center text-gray-500 mt-10">No articles found.</Text>
      ) : (
        filteredArticles.map((article) => (
          <TouchableOpacity
            key={article.article_id}
            className="mb-5 rounded-xl border border-black bg-[#f8f8f8] overflow-hidden min-h-[250px] justify-between"
            onPress={() =>
              router.push({
                pathname: "/expert/article/[id]",
                params: { id: article.article_id.toString() },
              })
            }
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: article.signed_photo_url }}
              className="w-full h-[180px]"
              resizeMode="cover"
            />

            <View className="px-3 py-2">
              {/* Title */}
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="text-lg font-bold text-black mb-1"
              >
                {article.title}
              </Text>

              {/* Category and Access Type */}
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600">
                  {article.category_title || "Uncategorized"}
                </Text>

                <View
                  className={`px-2 py-1 rounded-full ${
                    article.is_free
                      ? "bg-green-100 border border-green-500"
                      : "bg-yellow-100 border border-yellow-500"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      article.is_free ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {article.is_free ? "Free" : "Premium"}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}