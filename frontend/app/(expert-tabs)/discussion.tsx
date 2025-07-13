import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchIcon from "../../assets/images/search.svg";
import FilterIcon from "../../assets/images/filter.svg";
import DiscussionCard, { Discussion } from "../../components/DiscussionCard";
import FilterModal from "../../components/FilterModalFeed";

export default function DiscussionScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        const res = await fetch(`${API_URL}/api/discussions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setDiscussions(data.discussions || []);
        } else {
          console.error("Failed to load discussions:", data.message);
        }
      } catch (err) {
        console.error("Discussion fetch error:", err);
      }
    };

    fetchDiscussions();
  }, []);

  const filteredDiscussions = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return discussions.filter(
      (d) =>
        typeof d.text === "string" && d.text.toLowerCase().includes(keyword)
    );
  }, [discussions, searchText]);

  const handleDiscussionPress = (discussion: Discussion) => {
    router.push(`/discussion/${discussion.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search & Filter Bar */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12 mr-3 border-2 border-[#459B6C]">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search discussions"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="p-3 bg-white rounded-xl border-2 border-[#459B6C]"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Discussions List */}
      <FlatList
        data={filteredDiscussions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DiscussionCard
            discussion={item}
            onPress={() => handleDiscussionPress(item)}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />
    </SafeAreaView>
  );
}
