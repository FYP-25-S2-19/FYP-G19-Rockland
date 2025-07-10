import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateDiscussion() {
  const [text, setText] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert("Validation", "Please enter a discussion topic.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("accessToken");
      console.log("🧪 Token used for posting discussion:", token);
      if (!token) {
        Alert.alert("Authentication", "Please log in to create a discussion.");
        return;
      }

      const res = await fetch(`${API_URL}/api/discussions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });

      const json = await res.json();
      if (json.success) {
        Alert.alert("✅ Discussion Posted!", "Redirecting to feed...");
        router.push("/(tabs)/feed");
      } else {
        Alert.alert("Error", json.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("❌ Failed to post discussion:", err);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Start a New Discussion</Text>
      <TextInput
        placeholder="What's on your mind?"
        placeholderTextColor="#9ca3af"
        value={text}
        onChangeText={setText}
        multiline
        className="border border-gray-300 rounded-lg p-3 text-base text-gray-800"
        style={{ height: 120 }}
      />
      <TouchableOpacity
        className="bg-green-600 rounded-full mt-6 px-6 py-3 items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white text-base font-semibold">Post</Text>
      </TouchableOpacity>
    </View>
  );
}
