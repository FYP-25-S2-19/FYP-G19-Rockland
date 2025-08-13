import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Category = { categories_id: number; title: string };

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  throw new Error(`HTTP ${res.status} ${res.statusText} — Non-JSON:\n${text.slice(0, 300)}`);
}

export default function CreateDiscussion() {
  const [text, setText] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [posting, setPosting] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const router = useRouter();

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};

      const r = await fetch(`${API_URL}/api/categories/all`, { headers });
      if (!r.ok) throw new Error(`categories status ${r.status}`);
      const json = await safeJson(r);

      const cats: Category[] = (json.categories || json.data || []).filter(Boolean);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e: any) {
      console.warn("Categories fetch failed:", e.message);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert("Validation", "Please enter a discussion topic.");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Validation", "Please select a category.");
      return;
    }

    setPosting(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Authentication", "Please log in to create a discussion.");
        setPosting(false);
        return;
      }

      const body = {
        text: text.trim(),
        categories_id: selectedCategoryId,
      };

      const res = await fetch(`${API_URL}/api/discussions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await safeJson(res);
      if (json.success) {
        Alert.alert("✅ Discussion Posted!", "Redirecting to feed...");
        router.push("/(tabs)/feed");
      } else {
        Alert.alert("Error", json.message || "Something went wrong.");
      }
    } catch (err: any) {
      console.error("Failed to post discussion:", err);
      Alert.alert("Error", err.message?.slice(0, 300) || "Network / server error.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Start a New Discussion</Text>

      <TextInput
        placeholder="I'm curious about..."
        placeholderTextColor="#9ca3af"
        value={text}
        onChangeText={setText}
        multiline
        className="border border-gray-300 rounded-lg p-3 text-base text-gray-800"
        style={{ height: 120 }}
      />

      {/* Category Picker */}
      <Text className="text-base font-semibold mt-6 mb-2">Category</Text>
      {loadingCategories ? (
        <View className="flex-row items-center">
          <ActivityIndicator />
          <Text className="ml-2 text-gray-500">Loading…</Text>
        </View>
      ) : categories.length ? (
        <View className="flex-row flex-wrap">
          {categories.map((c) => {
            const selected = selectedCategoryId === c.categories_id;
            return (
              <TouchableOpacity
                key={c.categories_id}
                className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                  selected ? "bg-green-600" : "bg-gray-100"
                }`}
                onPress={() =>
                  setSelectedCategoryId(selected ? null : c.categories_id)
                }
              >
                <Text className={selected ? "text-white" : "text-gray-800"}>
                  {c.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-400">No categories available.</Text>
          <TouchableOpacity onPress={fetchCategories}>
            <Text className="text-green-700 font-semibold">Reload</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        className={`rounded-full mt-6 px-6 py-3 items-center ${
          posting ? "bg-gray-400" : "bg-green-600"
        }`}
        onPress={handleSubmit}
        disabled={posting}
      >
        <Text className="text-white text-base font-semibold">
          {posting ? "Posting..." : "Post"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
