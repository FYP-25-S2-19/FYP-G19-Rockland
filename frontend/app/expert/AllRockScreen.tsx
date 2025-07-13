import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { rockData } from "../../data/rocks";
import SearchIcon from "../../assets/images/search.svg";
import BackIcon from "../../assets/images/back.svg";
import FilterIcon from "../../assets/images/filter.svg";

export default function AllRocksScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
    const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter rocks by name based on search
  const filteredRocks = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return rockData.filter((rock) =>
      rock.name.toLowerCase().includes(keyword)
    );
  }, [searchText]);

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  };


  // Rarity badge background colors matching your BaseFeed style
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Rare":
        return "bg-green-600";
      case "Legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-600";
    }
  };

  const renderRockItem = ({ item }: { item: typeof rockData[0] }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: "/expert/viewrock/[id]",
        params: { id: item.id?.toString() ?? '' },
      })}
      className="flex-row items-center bg-white p-4 mb-2 rounded-xl shadow-sm"
      style={shadowStyle}
    >
      <Image
        source={item.image}
        className="w-16 h-16 rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-lg font-semibold text-black">{item.name}</Text>
        <Text className="text-sm text-gray-600">{item.type} Rock</Text>
      </View>
      <View
        className={`px-3 py-1 rounded-full shadow ${getRarityColor(
          item.rarity
        )}`}
      >
        <Text className="text-white font-semibold text-xs">{item.rarity}</Text>
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

      {/* Search Bar */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12 mr-3 border-2 border-gray-600">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="p-3 bg-white rounded-xl border-2 border-gray-600"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Rock list */}
      <FlatList
        data={filteredRocks}
        keyExtractor={(item) => item.id}
        renderItem={renderRockItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="text-gray-600 text-lg">No rocks found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
