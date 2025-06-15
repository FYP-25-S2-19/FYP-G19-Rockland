import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { sampleArticles } from "../../data/article";
import likeIcon from "../../assets/images/like.png";
import nolikeIcon from "../../assets/images/nolike.png";
import BackIcon from "../../assets/images/back.svg";

export default function ArticleDetail() {
    
  const { id, likes, liked } = useLocalSearchParams();
  const article = sampleArticles.find((item) => item.id.toString() === id);
  const router = useRouter();

  // ✅ Independent state for like button inside detail page
  const [likesCount, setLikesCount] = useState(parseInt(likes as string));
  const [isLiked, setIsLiked] = useState(liked === "1");

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const formatLikes = (count: number): string => {
    if (count >= 1000) {
      return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k";
    }
    return count.toString();
  };

  if (!article) {
    return <Text className="p-4">Article not found.</Text>;
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 pb-4">
            <BackIcon width={24} height={24} />
        </TouchableOpacity>
      <View className="flex-row items-center mb-4 pt-2">
        <Image source={article.authorImage} style={{ width: 40, height: 40, borderRadius: 999 }} className="mr-3" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{article.authorName}</Text>
          <Text className="text-xs text-gray-500">1 min ago</Text>
        </View>
        <View style={{ minWidth: 80, alignItems: 'center' }} className={`px-3 py-1 rounded-full ${article.isPremium ? "bg-[#EF9E1C]" : "bg-[#459B6C]"}`}>
          <Text className="text-white text-sm">{article.isPremium ? "Premium" : "Free"}</Text>
        </View>
      </View>

      <Text className="text-2xl font-bold mb-2">{article.title}</Text>

      <View className="self-start bg-green-100 px-2 py-1 rounded-lg mb-3 border border-green-600">
        <Text className="text-xs font-medium text-green-600">{article.category}</Text>
      </View>

      <Image source={article.thumbnail} style={{ width: "100%", height: 200, marginBottom: 20 }} resizeMode="cover" />

      <Text className="text-base text-gray-700 leading-6">{article.preview}</Text>

      <View className="flex-row items-center justify-end mt-5">
        <TouchableOpacity onPress={handleLike} className="flex-row items-center">
          <Image source={isLiked ? likeIcon : nolikeIcon} style={{ width: 22, height: 22, marginRight: 6 }} />
          <Text className="text-sm font-medium text-gray-500">{formatLikes(likesCount)}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
