import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, Image } from "react-native";
import { useRouter } from "expo-router";
import SearchIcon from "../assets/images/search.svg";
import BackIcon from "../assets/images/back.svg";
import FilterIcon from "../assets/images/filter.svg";

// import local images
const graniteImg = require("../assets/images/granite.png");
const limestoneImg = require("../assets/images/limestone.png");
const basaltImg = require("../assets/images/basalt.png");
const quartziteImg = require("../assets/images/quartzite.png");

export default function SearchRockScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false); // just prepared for later

  // Dummy rock data with local images
  const rockData = [
    { id: 1, name: "Granite", type: "Igneous", image: graniteImg },
    { id: 2, name: "Limestone", type: "Sedimentary", image: limestoneImg },
    { id: 3, name: "Basalt", type: "Igneous", image: basaltImg },
    { id: 4, name: "Quartzite", type: "Metamorphic", image: quartziteImg },
  ];

  const filteredRocks = rockData.filter((rock) =>
    rock.name.toLowerCase().includes(searchText.toLowerCase()) ||
    rock.type.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <BackIcon width={20} height={20} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Search Rocks</Text>
        <View className="w-10" />
      </View>

      {/* Search Bar with filter button */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mr-3 border border-gray-600">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800 p-0"
            style={{ paddingVertical: 0 }}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity onPress={() => setFilterModalVisible(true)} className="p-3 bg-gray-100 rounded-xl border border-gray-600">
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Rock List */}
      <FlatList
        data={filteredRocks}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-white p-3 border-b border-gray-200">
            <Image source={item.image} className="w-14 h-14 mr-3 rounded" />
            <View>
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              <Text className="text-sm text-gray-500">{item.type} Rock</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
