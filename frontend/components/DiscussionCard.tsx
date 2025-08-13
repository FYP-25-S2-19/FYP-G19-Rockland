import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { timeAgo } from "../utils/timeAgo";

export interface Discussion {
  id: number;
  user: string;
  timestamp: string;
  text: string;
  comment_count: number;
  isNew?: boolean;

  // Optional category fields from backend to_dict()
  categories_id?: number | null;
  category_title?: string | null;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onPress?: () => void;
}

export default function DiscussionCard({ discussion, onPress }: DiscussionCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/discussion/${discussion.id}`);
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-gray-300 rounded-full items-center justify-center mr-3">
            <Text className="text-gray-600 font-semibold text-sm">
              {discussion.user?.[0]?.toUpperCase() || "U"}
            </Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-base">{discussion.user}</Text>
            <Text className="text-gray-400 text-sm">{timeAgo(discussion.timestamp)}</Text>
          </View>
        </View>
        {discussion.isNew && (
          <View className="bg-green-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">New!</Text>
          </View>
        )}
      </View>

      {/* Main Text */}
      <Text className="text-gray-700 text-base leading-6 mb-3" numberOfLines={3}>
        {discussion.text}
      </Text>

      {/* Category badge (if present) */}
      {!!discussion.category_title && (
        <View className="flex-row flex-wrap mb-3">
          <View className="bg-green-100 border border-green-300 px-2 py-1 rounded-full mr-2 mb-2">
            <Text className="text-green-700 text-xs">#{discussion.category_title}</Text>
          </View>
        </View>
      )}

      {/* Footer: Reply icon + comment count */}
      <View className="flex-row items-center justify-end space-x-2">
        <Text className="text-gray-500 text-sm font-medium mr-1">
          {discussion.comment_count} {discussion.comment_count === 1 ? "reply" : "replies"}
        </Text>
        <Image
          source={require("../assets/images/reply.png")}
          style={{ width: 20, height: 20, tintColor: "#000" }}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}
