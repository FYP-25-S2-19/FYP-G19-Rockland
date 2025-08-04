import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../assets/images/back.svg";
import FilterIcon from "../assets/images/filter.svg";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Rock = {
  id?: number;
  rock_id?: number;
  name: string;
  type: string;
  rarity?: string;
  category?: string;
  location?: string;
  photo_url?: string;
};

export default function TradeCreate() {
  const router = useRouter();

  const [step, setStep] = useState<"give" | "receive">("give");
  const [userRocks, setUserRocks] = useState<Rock[]>([]);
  const [allRocks, setAllRocks] = useState<Rock[]>([]);
  const [filteredRocks, setFilteredRocks] = useState<Rock[]>([]);
  const [selectedGive, setSelectedGive] = useState<Rock | null>(null);
  const [selectedReceive, setSelectedReceive] = useState<Rock | null>(null);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "alphabet">("recent");
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  };

  useEffect(() => {
    const fetchUserRocks = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await axios.get(`${API_URL}/api/collection/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = res.data.collection.map((rock: any) => ({
        id: rock.collection_id,
        rock_id: rock.rock_id,
        name: rock.rock_name,
        type: rock.rock_type,
        rarity: rock.rock_rarity,
        category: rock.rock_category,
        location: rock.location_name,
        photo_url: rock.signed_url,
      }));

      setUserRocks(normalized);
      setFilteredRocks(normalized);
      setLoading(false);
    };

    const fetchAllRocks = async () => {
      const res = await axios.get(`${API_URL}/api/rocks`);
      const normalized = res.data.data.map((rock: any) => ({
        rock_id: rock.rock_id,
        name: rock.rock_name,
        type: rock.rock_type,
        rarity: rock.rarity,
        category: rock.category,
        location: rock.location_name,
        photo_url: rock.signed_url,
      }));

      setAllRocks(normalized);
    };

    fetchUserRocks();
    fetchAllRocks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [userRocks, allRocks, search, rarity, sortBy, categories, locations, step]);

  const applyFilters = () => {
    let list = step === "give" ? [...userRocks] : [...allRocks];

    list = list.filter((rock) =>
      (rock.name || "").toLowerCase().includes(search.toLowerCase())
    );

    if (rarity) {
      list = list.filter(
        (rock) => (rock.rarity || "").toLowerCase() === rarity.toLowerCase()
      );
    }

    if (categories.length > 0) {
      list = list.filter((rock) => categories.includes(rock.category || ""));
    }

    if (locations.length > 0) {
      list = list.filter((rock) => locations.includes(rock.location || ""));
    }

    if (sortBy === "alphabet") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRocks(list);
  };

  const handleSubmitTrade = async () => {
    const token = await AsyncStorage.getItem("accessToken");

    if (!selectedGive || !selectedReceive) {
      Alert.alert("Please select both rocks before submitting.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/trade/create`,
        {
          collection_id_offered: selectedGive.id,
          rock_id_requested: selectedReceive.rock_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("Success", "The trade offer has been created successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/tradelist?tab=myoffers"),
        },
      ]);
    } catch (err: any) {
      console.error("❌ Error response:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create trade offer."
      );
    }
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
          <TouchableOpacity
            onPress={() => {
              if (step === "give") {
                router.replace("/tradelist?tab=myoffers&from=create");
              } else {
                setStep("give");
              }
            }}
            className="p-2"
          >
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
          <Text className="text-lg font-bold">
            {step === "give" ? "Select A Rock to Give" : "Select A Rock to Receive"}
          </Text>
          <View className="w-10" />
        </View>

        {/* Search + Filter */}
        <View className="flex-row items-center px-4 py-3 mb-4 gap-x-3">
          <View
            className="flex-1 flex-row items-center bg-white rounded-xl px-4 h-12"
            style={shadowStyle}
          >
            <TextInput
              className="flex-1 text-base text-gray-800 p-0"
              value={search}
              onChangeText={setSearch}
              placeholder="Search..."
              placeholderTextColor="#9ca3af"
              style={{ paddingVertical: 0 }}
            />
          </View>

          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
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
            data={filteredRocks}
            keyExtractor={(item) => (item.id ?? item.rock_id ?? "").toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const isSelected =
                (step === "give" && selectedGive?.id === item.id) ||
                (step === "receive" && selectedReceive?.rock_id === item.rock_id);

              return (
                <TouchableOpacity
                  onPress={() => {
                    if (step === "give") {
                      setSelectedGive(item);
                    } else {
                      setSelectedReceive(item);
                    }
                  }}
                  style={{
                    backgroundColor: isSelected ? "#459B6C" : "#fff",
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
                        source={{ uri: item.photo_url }}
                        className="w-14 h-14 mr-4 rounded-md"
                      />
                      <View>
                        <Text
                          className={`text-base font-semibold ${
                            isSelected ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className={`text-sm ${
                            isSelected ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {item.type}
                        </Text>
                      </View>
                    </View>
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: isSelected
                          ? "#fff"
                          : item.rarity?.toLowerCase() === "common"
                          ? "#6D6D6D"
                          : item.rarity?.toLowerCase() === "rare"
                          ? "#459B6C"
                          : "#EF9E1C",
                      }}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          isSelected ? "text-green-600" : "text-white"
                        }`}
                      >
                        {item.rarity
                          ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)
                          : "Unknown"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Next / Submit Buttons */}
        {step === "give" && selectedGive && (
          <TouchableOpacity
            onPress={() => setStep("receive")}
            className="mx-4 mb-4 bg-[#459B6C] py-3 rounded-xl items-center"
            style={shadowStyle}
          >
            <Text className="text-white font-semibold text-base">
              Select Rock to Giveaway
            </Text>
          </TouchableOpacity>
        )}

        {step === "receive" && selectedReceive && (
          <TouchableOpacity
            onPress={handleSubmitTrade}
            className="mx-4 mb-4 bg-[#459B6C] py-3 rounded-xl items-center"
            style={shadowStyle}
          >
            <Text className="text-white font-semibold text-base">
              Create Trade Offer
            </Text>
          </TouchableOpacity>
        )}

        {/* Filter Modal */}
        <Modal visible={filterVisible} animationType="slide">
          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4 mt-10">
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <BackIcon width={20} height={20} />
              </TouchableOpacity>
              <Text className="text-lg font-bold">Filter</Text>
              <TouchableOpacity
                onPress={() => {
                  setRarity(null);
                  setSortBy("recent");
                  setCategories([]);
                  setLocations([]);
                }}
              >
                <Text className="text-red-500 font-bold">Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Rarity */}
            <Text className="text-base font-bold mb-2">Rarity</Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              {["Common", "Rare", "Legendary"].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRarity(r)}
                  style={{
                    borderWidth: 1,
                    borderColor: rarity === r ? "#459B6C" : "#ccc",
                    backgroundColor: rarity === r ? "#459B6C" : "white",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 20,
                  }}
                >
                  <Text
                    style={{
                      color: rarity === r ? "white" : "black",
                      fontWeight: "500",
                    }}
                  >
                    {r}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sort */}
            <Text className="text-base font-bold mb-2">Sort By</Text>
            <View
              style={{
                height: 50,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#ccc",
                backgroundColor: "white",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <Picker
                selectedValue={sortBy}
                onValueChange={(itemValue) => setSortBy(itemValue)}
                style={{ height: 50, width: "100%", color: "black" }}
              >
                <Picker.Item label="Sort by Most Recent" value="recent" />
                <Picker.Item label="Sort by Alphabet (A-Z)" value="alphabet" />
              </Picker>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              onPress={() => {
                applyFilters();
                setFilterVisible(false);
              }}
              style={{
                backgroundColor: "#459B6C",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Apply Filter</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
