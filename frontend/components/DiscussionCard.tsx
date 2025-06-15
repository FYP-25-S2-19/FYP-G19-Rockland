import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Comment and Discussion types reused across app
export interface Comment {
  id: number;
  user: string;
  time: string;
  text: string;
  replyTo?: number;
}

export interface Discussion {
  id: number;
  user: string;
  timestamp: string;
  text: string;
  comments: Comment[];
  isNew: boolean;
}

interface DiscussionCardProps {
  discussion: Discussion;
}

export default function DiscussionCard({ discussion }: DiscussionCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/discussion/${discussion.id}`);
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
              {discussion.user[0]}
            </Text>
          </View>
          <View>
            <Text className="text-gray-900 font-bold text-base">
              {discussion.user}
            </Text>
            <Text className="text-gray-400 text-sm">{discussion.timestamp}</Text>
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

      {/* Footer */}
      <View className="flex-row items-center justify-end">
        <Text className="text-gray-500 text-lg mr-1">💬</Text>
        <Text className="text-gray-500 text-sm font-medium">
          {discussion.comments.length}{" "}
          {discussion.comments.length === 1 ? "comment" : "comments"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
