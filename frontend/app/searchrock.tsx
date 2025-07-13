import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import SearchIcon from "../assets/images/search.svg";
import BackIcon from "../assets/images/back.svg";
import FilterIcon from "../assets/images/filter.svg";
import { LinearGradient } from "expo-linear-gradient";
import FilterModalRock from "../components/FilterModalRock";
import debounce from "lodash.debounce";
import axios from "axios";

export default function SearchRockScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [rocks, setRocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Sort by A-Z");

  const fetchRocks = async () => {
    setLoading(true);
    try {
      const params: any = {};

      if (searchText) params.rock_name = searchText;
      if (selectedTypes.length) params.rock_type = selectedTypes;
      if (selectedRarities.length) params.rarity = selectedRarities;
      if (selectedLocations.length) params.location = selectedLocations;

      switch (sortBy) {
        case "Sort by A-Z":
          params.sort_by = "az";
          break;
        case "Sort by Z-A":
          params.sort_by = "za";
          break;
        case "Sort by Most Commented":
          params.sort_by = "most_commented";
          break;
        case "Sort by Rarity":
          params.sort_by = "rarity";
          break;
        default:
          params.sort_by = "";
      }
      console.log("Search params:", params);

      const res = await axios.get(`${API_URL}/api/rocks/search`, { params });
      if (res.data.success) {
        setRocks(res.data.rocks);
      }
    } catch (err) {
      console.error("Failed to fetch rocks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounced = debounce(() => {
      fetchRocks();
    }, 500); 
  
    debounced();
    return () => debounced.cancel(); 
  }, [searchText, selectedTypes, selectedRarities, selectedLocations, sortBy]);

  const applyFilters = ({
    types,
    rarities,
    locations,
    sortOption,
  }: {
    types: string[];
    rarities: string[];
    locations: string[];
    sortOption: string;
  }) => {
    setSelectedTypes(types);
    setSelectedRarities(rarities);
    setSelectedLocations(locations);
    setSortBy(sortOption);
    setFilterModalVisible(false);
  };

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  };

  return (
    <LinearGradient
      colors={["#91D29E", "#FFFFFF"]}
      start={{ x: -1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-transparent">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
          <Text className="text-lg font-bold">Search Rocks</Text>
          <View className="w-10" />
        </View>

        {/* Search + Filter */}
        <View className="flex-row items-center px-4 py-3 mb-4 gap-x-3">
          <View
            className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12"
            style={shadowStyle}
          >
            <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
            <TextInput
              className="flex-1 text-base text-gray-800 p-0"
              value={searchText}
              onChangeText={(text) => setSearchText(text)} 
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              style={{ paddingVertical: 0 }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            className="p-3 bg-white rounded-xl"
            style={shadowStyle}
          >
            <FilterIcon width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Rock List */}
        {loading ? (
          <ActivityIndicator size="large" color="#459B6C" className="mt-10" />
        ) : (
          <FlatList
            data={rocks}
            keyExtractor={(item) => item.rock_id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/viewrock/[id]" as `/viewrock/[id]`,
                    params: { id: item.rock_id },
                  })
                }
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: item.signed_url }}
                      className="w-14 h-14 mr-4 rounded-md"
                    />
                    <View>
                      <Text className="text-base font-semibold text-gray-900">
                        {item.rock_name}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.rock_type}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        item.rarity === "common"
                          ? "#6D6D6D"
                          : item.rarity === "rare"
                          ? "#459B6C"
                          : "#EF9E1C",
                    }}
                  >
                    <Text className="text-xs font-medium text-white">
                      {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Filter Modal */}
        <FilterModalRock
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={applyFilters}
          defaultValues={{
            types: selectedTypes,
            rarities: selectedRarities,
            locations: selectedLocations,
            sortOption: sortBy,
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
