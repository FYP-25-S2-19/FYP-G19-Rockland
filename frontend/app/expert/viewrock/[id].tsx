import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../../assets/images/back.svg";
import ThumbUpIcon from "../../../assets/images/thumbup.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type CommentType = {
  id: number;
  user: string;
  text: string;
  time: string;
  likes: number;
  is_liked: boolean;
  replies?: CommentType[];
};

type RockType = {
  rock_id: number;
  rock_name: string;
  rock_type: string;
  description: string | null;
  fun_fact: string | null;
  rarity: string | null;
  hardness: string | null;
  color: string | null;
  composition: string | null;
  density: string | null;
  common_location: string | null;
  photo_url: string | null;
  signed_url: string | null;
};

export default function ExpertViewRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const rockId = Array.isArray(id) ? id[0] : id;

  const [rock, setRock] = useState<RockType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchRock = async () => {
      try {
        if (!rockId) return;
        const token = await AsyncStorage.getItem("accessToken");
        const response = await fetch(${API_URL}/api/viewrock/${rockId}, {
          headers: { Authorization: Bearer ${token} },
        });
        const data = await response.json();

        if (!response.ok || !data.success || !data.rock) {
          Alert.alert("Error", data.message || "Rock not found.");
          setLoading(false);
          return;
        }

        setRock(data.rock);
        setComments(data.comments || []);
        setCommentCount(data.total_comments || 0);

        const counts: Record<string, number> = {};
        const liked: Record<string, boolean> = {};
        (data.comments || []).forEach((c: CommentType) => {
          counts[c.id] = c.likes;
          liked[c.id] = c.is_liked;
          c.replies?.forEach((r: CommentType) => {
            counts[r.id] = r.likes;
            liked[r.id] = r.is_liked;
          });
        });
        setLikeCounts(counts);
        setLikedComments(liked);
      } catch {
        Alert.alert("Error", "Failed to fetch rock.");
      } finally {
        setLoading(false);
      }
    };

    fetchRock();
  }, [rockId]);

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) => {
      const newLiked = !prev[commentId];
      setLikeCounts((counts) => ({
        ...counts,
        [commentId]: (counts[commentId] ?? 0) + (newLiked ? 1 : -1),
      }));
      return { ...prev, [commentId]: newLiked };
    });
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const response = await fetch(${API_URL}/api/rocks/delete/${rock?.rock_id}, {
        method: "DELETE",
        headers: { Authorization: Bearer ${token} },
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Deleted", "Rock has been deleted.");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Delete failed.");
      }
    } catch {
      Alert.alert("Error", "Failed to delete rock.");
    } finally {
      setConfirmVisible(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
        <Text className="mt-2 text-gray-700">Loading rock...</Text>
      </View>
    );
  }

  if (!rock) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-600">Rock not found.</Text>
      </View>
    );
  }

  const propsToShow = [
    { k: "Hardness", v: rock.hardness },
    { k: "Color", v: rock.color },
    { k: "Composition", v: rock.composition },
    { k: "Density", v: rock.density },
  ].filter((p) => !!p.v);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView className="flex-1 bg-white p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Top Bar */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white border border-gray-400 rounded-xl items-center justify-center"
          >
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            className="w-10 h-10 bg-white border border-gray-400 rounded-xl items-center justify-center"
          >
            <Image
              source={require("../../../assets/images/more.png")}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Rock Image */}
        <View className="w-full aspect-square rounded-xl overflow-hidden mb-4">
          <Image
            source={{ uri: rock.signed_url || rock.photo_url || "" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <Text className="text-3xl font-bold text-black mb-2">{rock.rock_name}</Text>
        <Text className="text-lg text-gray-600 mb-1">Type: {rock.rock_type}</Text>
        {!!rock.rarity && (
          <Text className="text-sm font-semibold text-white px-3 py-1 rounded-full mb-4 bg-green-600 w-fit">
            Rarity: {rock.rarity}
          </Text>
        )}

        <Text className="text-xl font-bold mb-2">Description</Text>
        <Text className="text-base text-gray-800 mb-6">{rock.description || "-"}</Text>

        <Text className="text-xl font-bold mb-2">Properties</Text>
        {propsToShow.length === 0 ? (
          <Text className="text-gray-600 mb-4">No properties provided.</Text>
        ) : (
          propsToShow.map(({ k, v }) => (
            <View key={k} className="flex-row justify-between mb-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Text className="font-semibold">{k}</Text>
              <Text>{v}</Text>
            </View>
          ))
        )}

        <Text className="text-xl font-bold mt-4 mb-2">Common Locations</Text>
        {(rock.common_location || "")
          .split(",")
          .map((loc) => loc.trim())
          .filter(Boolean)
          .map((loc, i) => (
            <Text key={${loc}-${i}} className="text-base text-gray-700 mb-1">
              • {loc}
            </Text>
          ))}

        <Text className="text-xl font-bold mt-4 mb-2">Fun Fact</Text>
        <Text className="text-base text-gray-800 mb-6">{rock.fun_fact || "-"}</Text>

        <Text className="text-2xl font-bold mb-4">{commentCount} Comments</Text>
        {comments.map((comment) => (
          <View key={comment.id} className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="font-semibold text-black">{comment.user}</Text>
            <Text className="text-sm text-gray-500 mb-1">{comment.time}</Text>
            <Text className="text-base text-gray-800">{comment.text}</Text>

            <TouchableOpacity
              onPress={() => toggleLike(comment.id.toString())}
              className="flex-row items-center mt-2"
            >
              <ThumbUpIcon
                width={16}
                height={16}
                fill={likedComments[comment.id] ? "#459B6C" : "#9CA3AF"}
              />
              <Text className="ml-1 text-sm text-gray-700">{likeCounts[comment.id] ?? 0}</Text>
            </TouchableOpacity>

            {comment.replies?.map((reply) => (
              <View key={reply.id} className="ml-4 mt-3 pl-3 border-l border-gray-300">
                <Text className="font-semibold text-black">{reply.user}</Text>
                <Text className="text-sm text-gray-500">{reply.time}</Text>
                <Text className="text-base text-gray-800">{reply.text}</Text>
                <TouchableOpacity
                  onPress={() => toggleLike(reply.id.toString())}
                  className="flex-row items-center mt-1"
                >
                  <ThumbUpIcon
                    width={16}
                    height={16}
                    fill={likedComments[reply.id] ? "#459B6C" : "#9CA3AF"}
                  />
                  <Text className="ml-1 text-sm text-gray-700">{likeCounts[reply.id] ?? 0}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black bg-opacity-50" />
        </TouchableWithoutFeedback>

        <View className="absolute bottom-0 left-0 right-0 items-center">
          <View className="bg-white p-6 rounded-2xl mb-5 w-11/12 shadow-lg">
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                router.push({
                  pathname: "/expert/viewrock/edit/[id]",
                  params: { id: String(rock.rock_id) },
                });
              }}
              className="py-3"
            >
              <Text className="text-black font-bold text-lg text-left">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setConfirmVisible(true);
              }}
              className="py-3"
            >
              <Text className="text-red-600 font-bold text-lg text-left">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal transparent visible={confirmVisible} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setConfirmVisible(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
        </TouchableWithoutFeedback>
        <View className="absolute inset-0 justify-center items-center px-8">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md items-center shadow-lg">
            <Text className="text-2xl font-bold mb-3 text-black">Confirm Delete</Text>
            <Text className="text-base text-gray-600 mb-6 text-center">
              Are you sure you want to delete this rock?
            </Text>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-600 w-full py-3 rounded-xl items-center mb-3"
            >
              <Text className="text-white font-bold text-lg">Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmVisible(false)}
              className="bg-gray-200 w-full py-3 rounded-xl items-center"
            >
              <Text className="text-gray-800 font-bold text-lg">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}