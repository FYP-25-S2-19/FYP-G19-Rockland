import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { rockData } from '../../data/rocks';

function Card({ image, title, type }: { image: any; title: string; type?: string }) {
  return (
    <View className="w-[180px] h-[180px] rounded-xl border border-black bg-[#f8f8f8] overflow-hidden mb-5">
      <Image source={image} className="w-full h-[100px]" resizeMode="cover" />
      <View className="flex-1 justify-between bg-white p-2">
        <Text numberOfLines={2} className="text-base font-bold text-black">{title}</Text>
        {type && <Text className="text-sm text-[#333] mt-1">Type: {type}</Text>}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [rocks, setRocks] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingRocks, setLoadingRocks] = useState(true);

  const fetchRecentArticles = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/articles/my_recent`, { headers });

      if (res.data.success) {
        const formattedArticles = res.data.articles.map((article: any) => ({
          image: article.signed_photo_url,
          title: article.title,
          type: article.category_title,
          id: article.article_id,
        }));
        setArticles(formattedArticles);
      }
    } catch (err) {
      console.error("❌ Error fetching articles:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const fetchRecentRocks = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/api/rocks/user/me`, { headers });

      if (res.data.success) {
        const formattedRocks = res.data.rocks.map((rock: any) => ({
          id: rock.rock_id,
          image:
            rock.signed_photo_url || rock.signed_url
              ? { uri: rock.signed_photo_url || rock.signed_url }
              : require("../../assets/images/article1.png"),
          title: rock.rock_name,
          type: rock.rock_type,
        }));
        setRocks(formattedRocks);
      }
    } catch (err) {
      console.error("❌ Error fetching rocks:", err);
    } finally {
      setLoadingRocks(false);
    }
  };

  useEffect(() => {
    fetchRecentArticles();
    fetchRecentRocks();
  }, []);

  const toggleFloatingMenu = () => {
    setIsExpanded(prev => !prev);
  };

  const renderHorizontalGrid = (
    items: { image: any; title: string; type?: string; rarity?: string; id?: string | number }[],
    isArticle = false
  ) => {
    if (!items.length) {
      return (
        <View className="items-center justify-center mb-4">
          <Text className="text-[#666] italic">You don’t have any {isArticle ? 'articles' : 'rock entries'} yet.</Text>
        </View>
      );
    }

    const columnCount = Math.ceil(items.length / 2);
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
        <View className="flex-row">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <View key={colIndex} className="flex-col mx-[10px]">
              {items.slice(colIndex * 2, colIndex * 2 + 2).map((item, rowIndex) => {
                const key = colIndex * 2 + rowIndex;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (item.id !== undefined && item.id !== null) {
                        router.push({
                          pathname: isArticle ? "/expert/article/[id]" : "/expert/viewrock/[id]",
                          params: { id: String(item.id) },
                        });
                      }
                    }}
                  >
                    <Card
                      image={
                        typeof item.image === "string" && item.image.startsWith("http")
                          ? { uri: item.image }
                          : item.image ?? require("../../assets/images/article1.png")
                      }
                      title={item.title}
                      type={item.type}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-3 py-4 bg-white">
        <View className="items-center mb-5">
          <Text className="text-[33px] font-extrabold text-black mt-[30px]">ROCKLAND</Text>
          <Text className="text-[16px] font-bold text-black">#1 Download App Store</Text>
        </View>

        <View className="flex-row justify-between items-center mx-5 mt-2 mb-5">
          <Text className="text-[23px] font-bold text-black">My Articles</Text>
          <TouchableOpacity onPress={() => router.push('/expert/AllArticleScreen')}>
            <Text className="text-sm text-[#505050] underline font-medium">See More</Text>
          </TouchableOpacity>
        </View>

        {loadingArticles ? (
          <ActivityIndicator size="large" color="#459B6C" />
        ) : renderHorizontalGrid(articles, true)}

        <View className="flex-row justify-between items-center mx-5 mt-2 mb-5">
          <Text className="text-[23px] font-bold text-black">My Rock Entries</Text>
          <TouchableOpacity onPress={() => router.push('/expert/AllRockScreen')}>
            <Text className="text-sm text-[#505050] underline font-medium">See More</Text>
          </TouchableOpacity>
        </View>

        {loadingRocks ? (
          <ActivityIndicator size="large" color="#459B6C" />
        ) : renderHorizontalGrid(rocks)}
        <View className="h-[80px]" />
      </ScrollView>

      <View className="absolute right-5 bottom-5 items-center z-10">
        {isExpanded && (
          <>
            <TouchableOpacity
              className="w-[55px] h-[55px] rounded-full border border-[#459B6C] bg-white justify-center items-center mb-2"
              onPress={() => router.push('/expert/AddArticleScreen')}
            >
              <Image
                source={require('../../assets/icons/article.png')}
                className="w-[30px] h-[30px]"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-[55px] h-[55px] rounded-full border border-[#459B6C] bg-white justify-center items-center mb-2"
              onPress={() => router.push('/expert/AddRockScreen')}
            >
              <Image
                source={require('../../assets/icons/rock.png')}
                className="w-[30px] h-[30px]"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          className="w-[55px] h-[55px] rounded-full bg-[#459B6C] justify-center items-center shadow shadow-black"
          onPress={toggleFloatingMenu}
        >
          <Text className="text-white text-[40px] leading-[55px] text-center">{isExpanded ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}