import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../assets/images/back.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CommentType = {
  id: number;
  user: string;
  text: string;
  replyTo: number | null;
  time: string;
};

type DiscussionType = {
  id: number;
  user: string;
  text: string;
  timestamp: string;
};

type RepliesMap = {
  [key: number]: CommentType[];
};

export default function DiscussionDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [discussion, setDiscussion] = useState<DiscussionType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState("");

  const fetchDiscussionDetail = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setDiscussion(json.discussion);
        setComments(json.comments);
      }
    } catch (e) {
      console.error("Failed to fetch discussion detail", e);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("🧪 Token used for posting comment:", token);

      const res = await fetch(`${API_URL}/api/discussions/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newComment,
          reply_to: null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setComments((prev) => [...prev, json.comment]);
        setNewComment("");
      } else {
        alert("❌ Failed to post comment");
      }
    } catch (e) {
      console.error("Error posting comment", e);
    }
  };

  useEffect(() => {
    fetchDiscussionDetail();
  }, [id]);

  const topLevelComments = comments.filter((c) => c.replyTo === null);
  const repliesMap: RepliesMap = comments.reduce((map, comment) => {
    if (comment.replyTo !== null) {
      if (!map[comment.replyTo]) map[comment.replyTo] = [];
      map[comment.replyTo].push(comment);
    }
    return map;
  }, {} as RepliesMap);

  if (!discussion) {
    return (
      <View className="p-4">
        <Text>Discussion not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6">
      <TouchableOpacity onPress={() => router.back()} className="pb-4">
        <BackIcon width={24} height={24} />
      </TouchableOpacity>

      <View className="flex-row items-center mb-4">
        <View className="bg-black w-10 h-10 rounded-full justify-center items-center mr-3">
          <Text className="text-white font-semibold">{discussion.user[0]}</Text>
        </View>
        <View>
          <Text className="text-base font-bold text-gray-900">
            {discussion.user}
          </Text>
          <Text className="text-sm text-gray-500">{discussion.timestamp}</Text>
        </View>
      </View>

      <Text className="text-base text-gray-800 mb-6">{discussion.text}</Text>
      <Text className="text-base font-semibold mb-3">
        {comments.length} Comments
      </Text>

      {topLevelComments.map((comment) => (
        <View key={comment.id} className="mb-6">
          <View className="flex-row items-start">
            <View className="bg-gray-300 w-8 h-8 rounded-full mr-3 items-center justify-center">
              <Text className="text-gray-800 font-semibold">
                {comment.user[0]}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-sm">
                {comment.user}{" "}
                <Text className="text-xs text-gray-500">{comment.time}</Text>
              </Text>
              <Text className="text-sm text-gray-700 mb-1">{comment.text}</Text>
              <View className="flex-row items-center mb-2">
                <Text className="text-xs text-gray-500 mr-2">👍 0</Text>
                <TouchableOpacity>
                  <Text className="text-xs text-green-700">Reply</Text>
                </TouchableOpacity>
              </View>

              {(repliesMap[comment.id] || []).map((reply) => (
                <View
                  key={reply.id}
                  className="ml-6 mt-2 pl-3 border-l border-gray-300"
                >
                  <View className="flex-row items-start">
                    <View className="bg-gray-200 w-6 h-6 rounded-full mr-2 items-center justify-center">
                      <Text className="text-gray-700 text-xs font-bold">
                        {reply.user[0]}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-sm">
                        {reply.user}{" "}
                        <Text className="text-xs text-gray-500">
                          {reply.time}
                        </Text>
                      </Text>
                      <Text className="text-sm text-gray-700 mb-1">
                        {reply.text}
                      </Text>
                      <Text className="text-xs text-gray-500">👍 0</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      {/* ⬇️ Comment Input Box */}
      <View className="flex-row items-center border border-gray-300 rounded-full px-4 py-2 mt-4">
        <TextInput
          className="flex-1 text-sm text-gray-800"
          placeholder="Add a comment..."
          placeholderTextColor="#9ca3af"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity className="ml-2" onPress={postComment}>
          <Text className="text-green-600 text-lg">↑</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
