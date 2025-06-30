import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import BackIcon from "../assets/images/back.svg";
import SearchIcon from "../assets/images/search.svg";
import FilterIcon from "../assets/images/filter.svg";
import SavedRockCard from "../components/SavedRockCard";

const sampleRocks = [
  {
    id: 1,
    image: require("../assets/images/granite.png"),
    name: "Gabbro",
    type: "Igneous Rock",
    rarity: "Rare",
    method: "Scanned",
    location: "Not Available",
    collectedDate: "12/12/2025",
  },
  {
    id: 2,
    image: require("../assets/images/basalt.png"),
    name: "Basalt",
    type: "Igneous Rock",
    rarity: "Common",
    method: "Discovered",
    location: "Mount Fuji",
    collectedDate: "05/06/2025",
  },
  {
    id: 3,
    image: require("../assets/images/basalt.png"),
    name: "Obsidian",
    type: "Igneous Rock",
    rarity: "Legendary",
    method: "Discovered",
    location: "Iceland",
    collectedDate: "09/01/2025",
  },
  {
    id: 4,
    image: require("../assets/images/quartzite.png"),
    name: "Quartzite",
    type: "Metamorphic Rock",
    rarity: "Rare",
    method: "Scanned",
    location: "Unknown",
    collectedDate: "04/02/2025",
  },
  {
    id: 5,
    image: require("../assets/images/basalt.png"),
    name: "Sandstone",
    type: "Sedimentary Rock",
    rarity: "Common",
    method: "Discovered",
    location: "Grand Canyon",
    collectedDate: "03/03/2025",
  },
];

export default function MyCollectionScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"All" | "Scanned" | "Discovered">("All");
  const [rocks, setRocks] = useState(sampleRocks);
  const [selectedRockId, setSelectedRockId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const numColumns = 2;
  const gap = 16;
  const horizontalMargin = 20;
  const totalSpacing = gap * (numColumns - 1) + horizontalMargin * 2;
  const cardWidth = (screenWidth - totalSpacing) / numColumns;

  const handleTabPress = (tab: "All" | "Scanned" | "Discovered") => {
    setActiveTab(tab);
  };

  const confirmDelete = (id: number) => {
    setSelectedRockId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (selectedRockId !== null) {
      setRocks((prev) => prev.filter((rock) => rock.id !== selectedRockId));
      setSelectedRockId(null);
      setShowDeleteModal(false);
    }
  };

  const filteredRocks = rocks.filter((rock) => {
    const matchesSearch =
      rock.name.toLowerCase().includes(searchText.toLowerCase()) ||
      rock.type.toLowerCase().includes(searchText.toLowerCase()) ||
      rock.location.toLowerCase().includes(searchText.toLowerCase());

    const matchesTab = activeTab === "All" || rock.method === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center py-5 relative">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-5">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">My Collection</Text>
      </View>

      {/* Search & Filter */}
      <View className="flex-row px-4 py-3 items-center mb-1">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mr-3 border border-gray-500">
          <SearchIcon width={20} height={20} style={{ marginRight: 10 }} />
          <TextInput
            className="flex-1 text-base text-gray-800"
            style={{
              height: 48,
              paddingVertical: 12,
              paddingHorizontal: 0,
              lineHeight: 20,
            }}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search..."
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          className="p-3 bg-gray-100 rounded-xl border border-gray-500"
        >
          <FilterIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around border-b border-gray-200 px-4 mb-4">
        {["All", "Scanned", "Discovered"].map((tab) => {
          const count =
            tab === "All"
              ? rocks.length
              : rocks.filter((rock) => rock.method === tab).length;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab as typeof activeTab)}
              className="flex-1"
            >
              <View
                className="items-center pb-2 border-b-2"
                style={{
                  borderBottomColor: activeTab === tab ? "#000" : "transparent",
                }}
              >
                <Text
                  className={`text-base font-semibold ${
                    activeTab === tab ? "text-black" : "text-gray-400"
                  }`}
                >
                  {tab}
                </Text>
                <Text
                  className={`text-sm ${
                    activeTab === tab ? "text-black font-bold" : "text-gray-400"
                  }`}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Rock Grid */}
      {filteredRocks.length > 0 ? (
        <FlatList
          data={filteredRocks}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: 100,
            paddingHorizontal: horizontalMargin,
          }}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginBottom: 20,
          }}
          renderItem={({ item, index }) => {
            const isLastItem = index === filteredRocks.length - 1;
            const isOdd = filteredRocks.length % numColumns === 1;
            const isLastRowSingle = isOdd && isLastItem;

            return (
              <View
                style={{
                  width: cardWidth,
                  marginRight:
                    index % numColumns !== numColumns - 1 && !isLastRowSingle
                      ? gap
                      : 0,
                }}
              >
                <SavedRockCard
                  image={item.image}
                  name={item.name}
                  type={item.type}
                  rarity={item.rarity as "Common" | "Rare" | "Legendary"}
                  method={item.method as "Scanned" | "Discovered"}
                  location={item.location}
                  collectedDate={item.collectedDate}
                  onDelete={() => confirmDelete(item.id)}
                />
              </View>
            );
          }}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-lg text-gray-500 text-center">
            {activeTab === "All" && "You don't have any rocks in your collection yet."}
            {activeTab === "Scanned" && "No scanned rocks found yet."}
            {activeTab === "Discovered" && "No discovered rocks yet."}
          </Text>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="bg-white p-6 rounded-2xl w-full max-w-[320px] items-center">
            <Text className="text-3xl mb-2">⚠️</Text>
            <Text className="text-lg font-bold text-gray-900 mb-2">Delete rock</Text>
            <Text className="text-sm text-center text-gray-500 mb-6">
              Are you sure you want to delete this rock? This action cannot be undone.
            </Text>
            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-100 rounded-lg"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-red-600 rounded-lg ml-3"
                onPress={handleDeleteConfirmed}
              >
                <Text className="text-center text-white font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-30">
          <View className="bg-white p-5 rounded-t-2xl shadow-lg">
            <Text className="text-lg font-semibold mb-4">Filter Options</Text>
            <TouchableOpacity
              onPress={() => setFilterModalVisible(false)}
              className="mt-2 bg-gray-800 py-3 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
