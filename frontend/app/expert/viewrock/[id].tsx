import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rockData, Rock } from "../../../data/rocks";
import BackIcon from "../../../assets/images/back.svg";
import ThumbUpIcon from "../../../assets/images/thumbup.svg";

export default function ExpertViewRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [rock, setRock] = useState<Rock | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const foundRock = rockData.find((r) => r.id === id);
    if (foundRock) {
      setRock(foundRock);

      const initialCounts: Record<string, number> = {};
      foundRock.comments.forEach((comment) => {
        initialCounts[comment.id.toString()] = comment.likes;
        comment.replies?.forEach((reply) => {
          initialCounts[reply.id.toString()] = reply.likes;
        });
      });
      setLikeCounts(initialCounts);
    }
    setLoading(false);
  }, [id]);

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
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-gray-600">Rock not found.</Text>
      </View>
    );
  }

  const toggleLike = (commentId: string) => {
    setLikedComments((prev) => {
      const newLiked = !prev[commentId];
      setLikeCounts((counts) => ({
        ...counts,
        [commentId]: counts[commentId] + (newLiked ? 1 : -1),
      }));
      return { ...prev, [commentId]: newLiked };
    });
  };

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
        pathname: "/expert/viewrock/edit/[id]",
        params: { id: rock.id.toString() },
      });
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    setConfirmVisible(false);
    Alert.alert("Deleted", "The rock has been deleted.");
    router.back();
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 bg-white p-4"
      >
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
                source={require('../../../assets/images/more.png')}
                style={{
                    width: 24,
                    height: 24,
                    tintColor: '#000',
                    resizeMode: 'contain',
                }}
                />
          </TouchableOpacity>
        </View>

        {/* Rock Image */}
        <View className="w-full aspect-square rounded-xl overflow-hidden mb-2">
          <Image
            source={rock.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Title & Rarity */}
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-3xl font-bold text-gray-900">{rock.name}</Text>
          <Text
            className={`text-sm font-semibold text-white px-3 py-1 rounded-full ${
              rock.rarity === "Common"
                ? "bg-gray-600"
                : rock.rarity === "Rare"
                ? "bg-green-700"
                : "bg-yellow-500"
            }`}
          >
            Rarity: {rock.rarity}
          </Text>
        </View>

        {/* Type */}
        <Text className="text-xl text-gray-600 mb-6">Type: {rock.type} Rock</Text>

        {/* Description */}
        <Text className="text-2xl font-bold mb-2 text-gray-900">Description</Text>
        <Text className="text-base text-gray-800 mb-6">{rock.description}</Text>

        {/* Properties */}
        <Text className="text-2xl font-bold mb-2 text-gray-900">Properties</Text>
        {Object.entries(rock.properties).map(([key, value]) => (
          <View
            key={key}
            className={`flex-row justify-between rounded-lg px-4 py-3 mb-2 ${
              key === "Color" || key === "Composition" ? "bg-green-100" : ""
            }`}
          >
            <Text className="font-semibold text-gray-800">{key}</Text>
            <Text className="text-gray-700">{value}</Text>
          </View>
        ))}

        {/* Common Locations */}
        <Text className="text-2xl font-bold mb-2 text-gray-900">Common Location</Text>
        <View className="pl-2 mb-6">
          {rock.commonLocations.map((loc, i) => (
            <Text key={i} className="text-base text-gray-700">
              • {loc}
            </Text>
          ))}
        </View>

        {/* Fun Fact */}
        <Text className="text-2xl font-bold mb-2 text-gray-900">Fun Fact</Text>
        <Text className="text-base text-gray-800 mb-6">{rock.funFact}</Text>

        {/* Comments Section */}
        <View className="mt-8 border-t border-gray-300 pt-4">
          <Text className="text-2xl font-bold mb-4">{rock.comments.length} Comments</Text>

          {rock.comments.map((comment) => (
            <View
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 mb-6"
            >
              <Text className="font-semibold text-gray-900">
                {comment.user}{" "}
                <Text className="text-xs text-gray-400">{comment.time}</Text>
              </Text>
              <Text className="text-base text-gray-800 mt-1">{comment.text}</Text>

              <View className="flex-row items-center mt-2 space-x-4">
                <TouchableOpacity
                  onPress={() => toggleLike(comment.id.toString())}
                  className="flex-row items-center space-x-1"
                >
                  <ThumbUpIcon
                    width={16}
                    height={16}
                    fill={likedComments[comment.id] ? "#459B6C" : "#9CA3AF"}
                  />
                  <Text className="ml-1 text-sm text-gray-700">{likeCounts[comment.id]}</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                </TouchableOpacity>
              </View>

              {/* Replies */}
              {comment.replies?.map((reply) => (
                <View
                  key={reply.id}
                  className="ml-4 mt-4 pl-3 border-l-2 border-gray-200"
                >
                  <Text className="font-semibold text-gray-900">
                    {reply.user}{" "}
                    <Text className="text-xs text-gray-400">{reply.time}</Text>
                  </Text>
                  <Text className="text-base text-gray-800 mt-1">{reply.text}</Text>

                  <View className="flex-row items-center mt-2 space-x-4">
                    <TouchableOpacity
                      onPress={() => toggleLike(reply.id.toString())}
                      className="flex-row items-center space-x-1"
                    >
                      <ThumbUpIcon
                        width={16}
                        height={16}
                        fill={likedComments[reply.id] ? "#459B6C" : "#9CA3AF"}
                      />
                      <Text className="ml-1 text-sm text-gray-700">{likeCounts[reply.id]}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text className="ml-6 text-sm text-green-700 font-medium">Reply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Comment Input */}
        <View className="flex-row items-center border-t border-gray-300 pt-4 mt-2 bg-white">
          <TextInput
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 px-4 py-2 rounded-lg"
          />
          <TouchableOpacity className="ml-2 bg-black px-4 py-2 rounded-lg">
            <Text className="text-white">Post</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View className="flex-1 bg-black bg-opacity-50" />
        </TouchableWithoutFeedback>

        <View className="absolute bottom-0 left-0 right-0 items-center">
          <View className="bg-purple-100 p-6 rounded-2xl mb-5 w-11/12 shadow-lg">
            <TouchableOpacity
              onPress={handleEdit}
              className="py-3"
              activeOpacity={0.7}
            >
              <Text className="text-purple-800 font-bold text-lg text-left">
                Edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeletePress}
              className="py-3"
              activeOpacity={0.7}
            >
              <Text className="text-purple-800 font-bold text-lg text-left">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={handleCancelDelete}
        >
        <TouchableWithoutFeedback onPress={handleCancelDelete}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </TouchableWithoutFeedback>
        <View className="flex-1 justify-center items-center bg-transparent px-8 absolute inset-0">
            <View className="bg-white rounded-2xl p-6 w-full max-w-md items-center shadow-lg">
            <Text className="text-2xl font-bold mb-3 text-black">Confirm Delete</Text>
            <Text className="text-base text-gray-600 mb-6 text-center">
                Are you sure you want to remove this rock?
            </Text>
            <View className="flex-col w-full space-y-3">
                <TouchableOpacity
                onPress={handleConfirmDelete}
                activeOpacity={0.8}
                className="bg-red-600 rounded-xl py-3 items-center shadow-md"
                >
                <Text className="text-white font-bold text-lg">Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                onPress={handleCancelDelete}
                activeOpacity={0.8}
                className="bg-gray-200 rounded-xl py-3 items-center"
                >
                <Text className="text-gray-800 font-bold text-lg">Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>

    </KeyboardAvoidingView>
  );
}
