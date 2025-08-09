import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Icons (adjust import paths if yours differ)
import SearchIcon from "../../assets/images/search.svg";
import BackIcon from "../../assets/images/back.svg";
import FilterIcon from "../../assets/images/filter.svg";

type RockItem = {
  rock_id: number;
  rock_name: string;
  rock_type: string;
  rarity: "Common" | "Rare" | "Legendary" | string;
  signed_url?: string;
  
};

export default function AllRockScreen() {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [rocks, setRocks] = useState<RockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.EXPO_PUBLIC_API_URL;

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchRocks = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("accessToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token) {
        console.warn("⚠️ No accessToken found");
        setRocks([]);
        setLoading(false);
        // Optional: router.replace("/auth/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      // Try /me first
      let url = `${API}/api/rocks/user/me`;
      console.log("📡 GET", url);
      let res = await axios.get(url, { headers });

      // If backend returns not-success, or you want to be extra safe, fallback to /user/:id
      if (!res.data?.success && userId) {
        url = `${API}/api/rocks/user/${userId}`;
        console.log("📡 Fallback GET", url);
        res = await axios.get(url, { headers });
      }

      if (res.status === 401) {
        console.warn("🔒 401 Unauthorized from /me");
        // Optional: router.replace("/auth/login");
        setRocks([]);
        return;
      }

      if (res.data?.rocks) {
        setRocks(res.data.rocks);
        console.log(`✅ Loaded ${res.data.rocks.length} rocks`);
      } else {
        setRocks([]);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.warn("🔒 401 Unauthorized:", error?.response?.data);
        // Optional UX:
        // Alert.alert("Session expired", "Please log in again.", [
        //   { text: "OK", onPress: () => router.replace("/auth/login") },
        // ]);
      } else {
        console.error("❌ Failed to fetch rocks:", error?.message || error);
      }
      setRocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRocks();
  }, []);

  const filteredRocks = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return rocks;
    return rocks.filter((r) => r.rock_name?.toLowerCase().includes(keyword));
  }, [searchText, rocks]);

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "Rare":
        return "bg-green-600";
      case "Legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-600";
    }
  };

  const onPressRock = (item: RockItem) => {
    if (!item?.rock_id || isNaN(Number(item.rock_id))) {
      Alert.alert("Oops", "This rock id is invalid.");
      return;
    }
    router.push({
      pathname: "/expert/viewrock/[id]",
      params: { id: String(item.rock_id) },
    });
  };

  const renderRockItem = ({ item }: { item: RockItem }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPressRock(item)}
      className="flex-row items-center bg-white p-4 mb-2 rounded-xl shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <Image
        source={
          item.signed_url
            ? { uri: item.signed_url }
            : require("../../assets/images/article1.png")
        }
        className="w-16 h-16 rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-black" numberOfLines={1}>
          {item.rock_name || "Untitled"}
        </Text>
        <Text className="text-sm text-gray-600" numberOfLines={1}>
          {item.rock_type ? `${item.rock_type}` : "—"}
        </Text>
      </View>
      <View className={`px-3 py-1 rounded-full shadow ${getRarityBadge(item.rarity)}`}>
        <Text className="text-white font-semibold text-xs">{item.rarity || "Common"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center mt-5 px-4 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-3xl ml-4 font-bold text-black">My Rock Entries</Text>
      </View>

      {/* Search + Filter */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12 mr-3 border-2 border-gray-600">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          className="p-3 bg-white rounded-xl border-2 border-gray-600"
          onPress={() => {
            // future: setFilterModalVisible(true)
          }}
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#459B6C" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={filteredRocks}
          keyExtractor={(item) => String(item.rock_id)}
          renderItem={renderRockItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20 px-6">
              <Text className="text-gray-600 text-lg text-center">
                You don’t have any rock entries yet.
              </Text>
              <TouchableOpacity
                className="mt-4 bg-[#459B6C] px-4 py-2 rounded-xl"
                onPress={() => router.push("/expert/AddRockScreen")}
              >
                <Text className="text-white font-semibold">Add Rock</Text>
              </TouchableOpacity>
            </View>
          }
          onRefresh={fetchRocks}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}
