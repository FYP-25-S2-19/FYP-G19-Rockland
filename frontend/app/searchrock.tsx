import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import SearchIcon from "../assets/images/search.svg";
import BackIcon from "../assets/images/back.svg";
import FilterIcon from "../assets/images/filter.svg";
import { rockData } from "../data/rocks";
import { LinearGradient } from "expo-linear-gradient";

export default function SearchRockScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const filteredRocks = rockData.filter(
    (rock) =>
      rock.name.toLowerCase().includes(searchText.toLowerCase()) ||
      rock.type.toLowerCase().includes(searchText.toLowerCase())
  );

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

        {/* Search Bar + Filter */}
        <View className="flex-row items-center px-4 py-3 mb-4 gap-x-3">
          <View
            className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12"
            style={shadowStyle}
          >
            <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
            <TextInput
              className="flex-1 text-base text-gray-800 p-0"
              style={{
                paddingVertical: 0,
                textAlignVertical: "center",
              }}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
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
        <FlatList
          data={filteredRocks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/viewrock/[id]" as `/viewrock/[id]`,
                  params: { id: item.id },
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
                    source={item.image}
                    className="w-14 h-14 mr-4 rounded-md"
                  />
                  <View>
                    <Text className="text-base font-semibold text-gray-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {item.type} Rock
                    </Text>
                  </View>
                </View>

                <View
                  className="px-3 py-1 rounded-full"
                  style={{
                    backgroundColor:
                      item.rarity === "Common"
                        ? "#6D6D6D"
                        : item.rarity === "Rare"
                        ? "#459B6C"
                        : "#EF9E1C",
                  }}
                >
                  <Text className="text-xs font-medium text-white">
                    {item.rarity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
