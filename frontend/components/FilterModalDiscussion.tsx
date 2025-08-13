import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = {
  visible: boolean;
  onClose: () => void;
  // "desc"=Newest, "asc"=Oldest, "rec"=Recommended
  currentSort: "asc" | "desc" | "rec";
  selectedCategoryId: number | null;
  onApply: (sort: "asc" | "desc" | "rec", categoryId: number | null) => void;
};

type Category = { categories_id: number; title: string };

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function FilterModalDiscussion({
  visible,
  onClose,
  currentSort,
  selectedCategoryId,
  onApply,
}: Props) {
  const [sortBy, setSortBy] = useState<"asc" | "desc" | "rec">(currentSort);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pickedCategoryId, setPickedCategoryId] = useState<number | null>(selectedCategoryId);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
      const r = await fetch(`${API_URL}/api/categories/all`, { headers });
      const json = await r.json();
      const cats: Category[] = (json.categories || json.data || []).filter(Boolean);
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (e) {
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSortBy(currentSort);
      setPickedCategoryId(selectedCategoryId);
      setShowSortDropdown(false);
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleApply = () => {
    onApply(sortBy, pickedCategoryId ?? null);
    onClose();
  };

  const sortLabel = (v: "asc" | "desc" | "rec") =>
    v === "rec" ? "Recommended" : v === "desc" ? "Newest First" : "Oldest First";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-2xl w-full max-h-[75%] overflow-hidden">
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={onClose}>
                <BackIcon width={20} height={20} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">Filter Discussions</Text>
              <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              {/* Sort Section */}
              <View className="px-4 mt-5">
                <Text className="text-lg font-semibold mb-3">Sort By</Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  onPress={() => setShowSortDropdown((prev) => !prev)}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-gray-900">{sortLabel(sortBy)}</Text>
                    <ChevronDownIcon width={18} height={18} />
                  </View>
                </TouchableOpacity>

                {showSortDropdown && (
                  <View className="mt-2 bg-white border border-gray-200 rounded-lg">
                    {[
                      { label: "Recommended", value: "rec" },
                      { label: "Newest First", value: "desc" },
                      { label: "Oldest First", value: "asc" },
                    ].map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSortBy(option.value as "asc" | "desc" | "rec");
                          setShowSortDropdown(false);
                        }}
                        className={`px-4 py-2 ${sortBy === option.value ? "bg-green-600" : ""}`}
                      >
                        <Text
                          className={`text-base ${
                            sortBy === option.value ? "font-semibold text-white" : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Category Section */}
              <View className="px-4 mt-6">
                <Text className="text-lg font-semibold mb-3">Category</Text>
                {loadingCategories ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator />
                    <Text className="ml-2 text-gray-500">Loading categories…</Text>
                  </View>
                ) : categories.length ? (
                  <View className="flex-row flex-wrap">
                    {/* "All" option */}
                    <TouchableOpacity
                      className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                        pickedCategoryId == null ? "bg-green-600" : "bg-gray-100"
                      }`}
                      onPress={() => setPickedCategoryId(null)}
                    >
                      <Text className={pickedCategoryId == null ? "text-white" : "text-gray-800"}>
                        All
                      </Text>
                    </TouchableOpacity>

                    {categories.map((c) => {
                      const selected = pickedCategoryId === c.categories_id;
                      return (
                        <TouchableOpacity
                          key={c.categories_id}
                          className={`px-3 py-2 rounded-full mr-2 mb-2 ${
                            selected ? "bg-green-600" : "bg-gray-100"
                          }`}
                          onPress={() => setPickedCategoryId(selected ? null : c.categories_id)}
                        >
                          <Text className={selected ? "text-white" : "text-gray-800"}>{c.title}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="text-gray-400">No categories available.</Text>
                )}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="p-4 border-t border-gray-200 bg-white">
              <TouchableOpacity onPress={handleApply} className="bg-green-600 py-4 rounded-lg items-center">
                <Text className="text-white text-lg font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
