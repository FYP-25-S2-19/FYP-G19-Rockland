import { View, Text, TouchableOpacity, Image } from "react-native";
import LikeIcon from "../assets/images/like.svg";
import NoLikeIcon from "../assets/images/nolike.svg";
import { useRouter } from "expo-router";
import { timeAgo } from "../utils/timeAgo";

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
  timeAgo: string; // ✅ already formatted when passed
}

type ArticleCardProps = {
  article: any;
  onLikeToggle: () => void;
  isPremiumUser: boolean;
  onUpgrade: () => void;
  updateLikeState?: (liked: boolean, likeCount: number) => void;
};



export default function ArticleCard({
  article,
  onLikeToggle,
  isPremiumUser,
  onUpgrade,
  updateLikeState, 
}: ArticleCardProps) {
  const router = useRouter();

  const handleArticlePress = () => {
    if (article.isPremium && !isPremiumUser) {
      onUpgrade();
    } else {
      router.push({
        pathname: "/article/[id]",
        params: { id: String(article.id) },
      });
    }
  };

  const handleLikePress = () => {
    if (article.isPremium && !isPremiumUser) {
      onUpgrade();
    } else {
      onLikeToggle();  // triggers optimistic UI
      if (typeof updateLikeState === "function") {
        const newLiked = !article.liked;
        const newLikes = article.likes + (newLiked ? 1 : -1);
        updateLikeState(newLiked, newLikes); // ✅
      }
    }
  };
  const formatLikes = (count: number): string => {
    return count >= 1000
      ? (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k"
      : count.toString();
  };

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  };

  console.log("💬 Liked status for", article.title, "=>", article.liked);
  console.log("Before toggle:", article.title, article.liked);

  return (
    <TouchableOpacity
      onPress={handleArticlePress}
      activeOpacity={0.8}
      className="bg-white rounded-xl mb-4 border border-gray-300 overflow-hidden"
    >
      <View className="flex-row items-center px-4 py-3">
        <Image
          source={article.authorImage}
          style={{ width: 40, height: 40, borderRadius: 999 }}
          className="mr-3"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {article.authorName}
          </Text>
          <Text className="text-xs text-gray-500">{article.timeAgo}</Text>
        </View>
        <View
          style={[{ minWidth: 80, alignItems: "center" }, shadowStyle]}
          className={`px-3 py-1 rounded-full ${
            article.isPremium ? "bg-[#EF9E1C]" : "bg-[#459B6C]"
          }`}
        >
          <Text className="text-white text-sm">
            {article.isPremium ? "Premium" : "Free"}
          </Text>
        </View>
      </View>

      <Image
        source={article.thumbnail}
        style={{ width: "100%", height: 200 }}
        resizeMode="cover"
      />

      <View className="px-4 pt-4 pb-4">
        <Text className="text-2xl font-semibold text-gray-900 mb-2 leading-7">
          {article.title}
        </Text>

        <View className="self-start bg-green-100 px-2 py-1 rounded-lg mb-2 border border-green-600">
          <Text className="text-xs font-medium text-green-600">
            {article.category}
          </Text>
        </View>

        <Text className="text-sm text-gray-500 leading-5">
          {article.preview.substring(0, 100)}...
        </Text>

        <View className="flex-row items-center justify-end mt-3">
          <TouchableOpacity
            onPress={handleLikePress}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            {article.liked ? (
              <LikeIcon width={21} height={21} style={{ marginRight: 6 }} />
            ) : (
              <NoLikeIcon
                width={24}
                height={24}
                style={{ marginRight: 6 }}
                fill="red"
              />
            )}
            <Text className="text-sm font-medium text-gray-500">
              {formatLikes(article.likes)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
