import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchIcon from "../../assets/images/search.svg";
import FilterIcon from "../../assets/images/filter.svg";
import DiscussionCard, { Discussion } from "../../components/DiscussionCard";
import FilterModal from "../../components/FilterModalFeed";


export default function ExpertDiscussionScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
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
        console.warn("⚠️ Failed to load discussions:", data.message);
      }
    } catch (err) {
      console.error("❌ Error fetching discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#459B6C" />
        </View>
      ) : (
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
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Text className="text-gray-600 text-lg">No discussions found.</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(filters) => {
          // You can add filter handling here if needed
          console.log("Applied filters:", filters);
        }}
        defaultValues={{
          selectedCategories: [],
          sortBy: "Newest",
        }}
      />
    </SafeAreaView>
  );
}
