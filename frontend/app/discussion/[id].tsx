// app/discussion/[id].tsx

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
import { timeAgo } from "../../utils/timeAgo";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CommentType = {
  id: number;
  user: string;
  text: string;
  replyTo: number | null;
  time: string;
  likes: number;
  liked_by_user: boolean;
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
  const [replyTo, setReplyTo] = useState<number | null>(null);

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

      const res = await fetch(`${API_URL}/api/discussions/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newComment,
          reply_to: replyTo,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setComments((prev) => [...prev, json.comment]);
        setNewComment("");
        setReplyTo(null);
      } else {
        alert("❌ Failed to post comment");
      }
    } catch (e) {
      console.error("Error posting comment", e);
    }
  };

  const toggleCommentLike = async (commentId: number, currentlyLiked: boolean) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const method = currentlyLiked ? "DELETE" : "POST";

      const res = await fetch(
        `${API_URL}/api/discussions/comments/${commentId}/${currentlyLiked ? "unlike" : "like"}`,
        {
          method,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const json = await res.json();
      if (json.success && json.data) {
        const { liked, like_count } = json.data;
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, liked_by_user: liked, likes: like_count }
              : c
          )
        );
      } else {
        alert("❌ Failed to update like");
      }
    } catch (e) {
      console.error("Error toggling comment like", e);
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
          <Text className="text-sm text-gray-500">{timeAgo(discussion.timestamp)}</Text>
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
                <Text className="text-xs text-gray-500">{timeAgo(comment.time)}</Text>
              </Text>
              <Text className="text-sm text-gray-700 mb-1">{comment.text}</Text>
              <View className="flex-row items-center mb-2">
                <TouchableOpacity
                  className="mr-3"
                  onPress={() => toggleCommentLike(comment.id, comment.liked_by_user)}
                >
                  <Text className={`text-xs ${comment.liked_by_user ? "text-green-700" : "text-gray-500"}`}>
                    👍 {comment.likes}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setReplyTo(comment.id);
                  setNewComment(`@${comment.user} `);
                }}>
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
                        <Text className="text-xs text-gray-500">{timeAgo(reply.time)}</Text>
                      </Text>
                      <Text className="text-sm text-gray-700 mb-1">
                        {reply.text}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          toggleCommentLike(reply.id, reply.liked_by_user)
                        }
                      >
                        <Text className={`text-xs ${reply.liked_by_user ? "text-green-700" : "text-gray-500"}`}>
                          👍 {reply.likes}
                        </Text>
                      </TouchableOpacity>
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
          placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
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
