import { View, Text, TouchableOpacity, Image } from "react-native";
import likeIcon from "../assets/images/like.png";
import nolikeIcon from "../assets/images/nolike.png";
import { useRouter } from "expo-router";

interface ArticleType {
  id: number;
  authorName: string;
  authorImage: any;
  isPremium: boolean;
  thumbnail: any;
  title: string;
  category: string;
  preview: string;
  likes: number;
  liked: boolean;
}

interface ArticleCardProps {
  article: ArticleType;
  onLikeToggle: () => void;
  isPremiumUser: boolean;
  onUpgrade: () => void;
}

export default function ArticleCard({
  article,
  onLikeToggle,
  isPremiumUser,
  onUpgrade
}: ArticleCardProps) {
  const router = useRouter();

  const handleArticlePress = () => {
    if (article.isPremium && !isPremiumUser) {
      onUpgrade();
    } else {
      router.push(`/article/${article.id}?likes=${article.likes}&liked=${article.liked ? "1" : "0"}`);
    }
  };

  const handleLikePress = () => {
    if (article.isPremium && !isPremiumUser) {
      onUpgrade();
    } else {
      onLikeToggle();
    }
  };

  const formatLikes = (count: number): string => {
    if (count >= 1000) {
      return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k";
    }
    return count.toString();
  };

  return (
    <TouchableOpacity onPress={handleArticlePress} activeOpacity={0.8} className="bg-[#EFEFEF] rounded-xl mb-4 border border-gray-600 overflow-hidden">
      <View className="flex-row items-center px-4 py-3">
        <Image source={article.authorImage} style={{ width: 40, height: 40, borderRadius: 999 }} className="mr-3" />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{article.authorName}</Text>
          <Text className="text-xs text-gray-500">1 min ago</Text>
        </View>
        <View style={{ minWidth: 80, alignItems: 'center' }} className={`px-3 py-1 rounded-full ${article.isPremium ? "bg-[#EF9E1C]" : "bg-[#459B6C]"}`}>
          <Text className="text-white text-sm">{article.isPremium ? "Premium" : "Free"}</Text>
        </View>
      </View>

      <Image source={article.thumbnail} style={{ width: "100%", height: 200 }} resizeMode="cover" />

      <View className="px-4 pt-4 pb-4">
        <Text className="text-xl font-semibold text-gray-900 mb-2 leading-5">{article.title}</Text>

        <View className="self-start bg-green-100 px-2 py-1 rounded-lg mb-2 border border-green-600">
          <Text className="text-xs font-medium text-green-600">{article.category}</Text>
        </View>

        <Text className="text-sm text-gray-500 leading-5">
          {article.preview.substring(0, 100)}...
        </Text>

        <View className="flex-row items-center justify-end mt-3">
          <TouchableOpacity onPress={handleLikePress} activeOpacity={0.7} className="flex-row items-center">
            <Image source={article.liked ? likeIcon : nolikeIcon} style={{ width: 22, height: 22, marginRight: 6 }} />
            <Text className="text-sm font-medium text-gray-500">{formatLikes(article.likes)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
