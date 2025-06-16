"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import Amethyst from "../assets/images/Amethyst.jpg";
import Quartz from "../assets/images/Quartz.webp";
import Obsidian from "../assets/images/Obsidian.webp";
import Granite from "../assets/images/Granite.webp";

// Rock type definitions
type Rock = {
  id: string;
  name: string;
  category: string;
  image: any; // Changed to any to handle imported images
  rarity: "Common" | "Rare" | "Legendary";
  country: string;
};

type FilterState = {
  categories: string[];
  countries: string[];
  rarity: string[];
  sortBy: string;
};

export default function CreateTradeOfferScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRockToGive, setSelectedRockToGive] = useState<Rock | null>(
    null
  );
  const [selectedRockToReceive, setSelectedRockToReceive] =
    useState<Rock | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    categories: ["Igneous Rock"],
    countries: ["Brazil"],
    rarity: [],
    sortBy: "A-Z",
  });

  // Sample rock data with imported images
  const availableRocks: Rock[] = [
    {
      id: "1",
      name: "Granite Boulder",
      category: "Igneous Rock",
      image: Granite,
      rarity: "Common",
      country: "Brazil",
    },
    {
      id: "2",
      name: "Amethyst Cluster",
      category: "Crystals",
      image: Amethyst,
      rarity: "Rare",
      country: "Brazil",
    },
    {
      id: "3",
      name: "Obsidian Shard",
      category: "Igneous Rock",
      image: Obsidian,
      rarity: "Common",
      country: "Indonesia",
    },
    {
      id: "4",
      name: "Diamond Crystal",
      category: "Crystals",
      image: Quartz, // Using Quartz as placeholder for Diamond
      rarity: "Legendary",
      country: "South Africa",
    },
    {
      id: "5",
      name: "Rose Quartz",
      category: "Crystals",
      image: Quartz,
      rarity: "Common",
      country: "Madagascar",
    },
    {
      id: "6",
      name: "Basalt Column",
      category: "Igneous Rock",
      image: Obsidian, // Using Obsidian as placeholder for Basalt
      rarity: "Rare",
      country: "Iceland",
    },
    {
      id: "7",
      name: "Emerald Gem",
      category: "Crystals",
      image: Amethyst, // Using Amethyst as placeholder for Emerald
      rarity: "Legendary",
      country: "Colombia",
    },
    {
      id: "8",
      name: "Pumice Stone",
      category: "Igneous Rock",
      image: Granite, // Using Granite as placeholder for Pumice
      rarity: "Common",
      country: "Italy",
    },
  ];

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedRockToReceive(null);
    } else {
      console.log("Back to previous screen");
    }
  };

  const handleRockSelect = (rock: Rock) => {
    if (step === 1) {
      setSelectedRockToGive(rock);
    } else {
      setSelectedRockToReceive(rock);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && selectedRockToGive) {
      setStep(2);
    }
  };

  const handleCreateTradeOffer = () => {
    if (selectedRockToGive && selectedRockToReceive) {
      console.log(
        "Create trade offer:",
        selectedRockToGive.name,
        "for",
        selectedRockToReceive.name
      );
    }
  };

  const handleShowFilter = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilter = () => {
    setShowFilterModal(false);
    console.log("Apply filters:", filters);
  };

  const handleResetFilter = () => {
    setFilters({
      categories: [],
      countries: [],
      rarity: [],
      sortBy: "A-Z",
    });
  };

  const removeFilterTag = (type: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item !== value),
    }));
  };

  const addFilterTag = (type: keyof FilterState, value: string) => {
    if (type === "rarity") {
      setFilters((prev) => ({
        ...prev,
        [type]: prev[type].includes(value)
          ? prev[type].filter((item) => item !== value)
          : [...prev[type], value],
      }));
    }
  };

  // Helper function to get image source
  const getImageSource = (image: any) => {
    if (typeof image === "string") {
      return { uri: image };
    }
    return image;
  };

  // Filter and sort rocks
  const filteredRocks = availableRocks
    .filter((rock) => {
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(rock.category)
      )
        return false;
      if (
        filters.countries.length > 0 &&
        !filters.countries.includes(rock.country)
      )
        return false;
      if (filters.rarity.length > 0 && !filters.rarity.includes(rock.rarity))
        return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === "A-Z") return a.name.localeCompare(b.name);
      if (filters.sortBy === "Rarity") {
        const rarityOrder = { Common: 1, Rare: 2, Legendary: 3 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      }
      return 0;
    });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-yellow-600";
      case "Rare":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const renderRockItem = (rock: Rock) => {
    const isSelected =
      step === 1
        ? selectedRockToGive?.id === rock.id
        : selectedRockToReceive?.id === rock.id;

    return (
      <TouchableOpacity
        key={rock.id}
        className="bg-white rounded-lg p-4 mb-3 border border-gray-200 shadow-sm"
        onPress={() => handleRockSelect(rock)}
      >
        <View className="flex-row items-center">
          <Image
            source={getImageSource(rock.image)}
            style={{
              width: 60,
              height: 60,
              borderRadius: 8,
              marginRight: 16,
            }}
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              {rock.name}
            </Text>
            <Text className="text-gray-600 text-sm mb-1">{rock.category}</Text>
            <Text
              className={`text-xs font-medium ${getRarityColor(rock.rarity)}`}
            >
              {rock.rarity}
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 ${isSelected ? "border-green-500 bg-green-500" : "border-gray-300"} items-center justify-center`}
          >
            {isSelected && <Text className="text-white text-xs">✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Text className="text-gray-900 text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 font-semibold text-lg">
            Create Trade Offer
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Rock Summary Section */}
        <View className="bg-gray-100 mx-4 mt-4 rounded-lg p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 items-center">
              <Text className="text-gray-600 text-sm mb-2">Trading:</Text>
              {selectedRockToGive ? (
                <View className="items-center">
                  <Image
                    source={getImageSource(selectedRockToGive.image)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                    resizeMode="cover"
                  />
                  <Text className="text-gray-900 text-xs font-medium text-center">
                    {selectedRockToGive.name}
                  </Text>
                </View>
              ) : (
                <View className="w-12 h-12 bg-gray-300 rounded-lg items-center justify-center">
                  <Text className="text-gray-500 text-xs">?</Text>
                </View>
              )}
            </View>
            <Text className="text-gray-400 text-lg mx-4">⇄</Text>
            <View className="flex-1 items-center">
              <Text className="text-gray-600 text-sm mb-2">For:</Text>
              {selectedRockToReceive ? (
                <View className="items-center">
                  <Image
                    source={getImageSource(selectedRockToReceive.image)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                    resizeMode="cover"
                  />
                  <Text className="text-gray-900 text-xs font-medium text-center">
                    {selectedRockToReceive.name}
                  </Text>
                </View>
              ) : (
                <View className="w-12 h-12 bg-gray-300 rounded-lg items-center justify-center">
                  <Text className="text-gray-500 text-xs">?</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-gray-900 font-semibold text-lg">
            {step === 1 ? "Select Rock to Give" : "Select Rock to Receive"}
          </Text>
          <TouchableOpacity
            onPress={handleShowFilter}
            className="bg-gray-200 px-3 py-2 rounded-lg"
          >
            <Text className="text-gray-700 text-sm">Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Rock List */}
        <View className="px-4 pb-6">{filteredRocks.map(renderRockItem)}</View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity
          className={`rounded-lg py-4 items-center ${
            (step === 1 && selectedRockToGive) ||
            (step === 2 && selectedRockToReceive)
              ? "bg-green-500"
              : "bg-gray-300"
          }`}
          onPress={step === 1 ? handleNextStep : handleCreateTradeOffer}
          disabled={step === 1 ? !selectedRockToGive : !selectedRockToReceive}
        >
          <Text
            className={`font-semibold text-lg ${
              (step === 1 && selectedRockToGive) ||
              (step === 2 && selectedRockToReceive)
                ? "text-white"
                : "text-gray-500"
            }`}
          >
            {step === 1 ? "Select Rock to Giveaway" : "Create Trade Offer"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text className="text-gray-900 text-lg">✕</Text>
            </TouchableOpacity>
            <Text className="text-gray-900 font-semibold text-lg">Filter</Text>
            <TouchableOpacity onPress={handleResetFilter}>
              <Text className="text-green-600 font-medium">Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Categories */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-base mb-3">
                Categories
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {filters.categories.map((category, index) => (
                  <View
                    key={index}
                    className="bg-green-100 px-3 py-2 rounded-full flex-row items-center"
                  >
                    <Text className="text-green-800 text-sm mr-2">
                      {category}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFilterTag("categories", category)}
                    >
                      <Text className="text-green-800 text-sm">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Countries */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-base mb-3">
                Countries
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {filters.countries.map((country, index) => (
                  <View
                    key={index}
                    className="bg-blue-100 px-3 py-2 rounded-full flex-row items-center"
                  >
                    <Text className="text-blue-800 text-sm mr-2">
                      {country}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFilterTag("countries", country)}
                    >
                      <Text className="text-blue-800 text-sm">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Rarity */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-base mb-3">
                Rarity
              </Text>
              <View className="flex-row gap-3">
                {["Common", "Rare", "Legendary"].map((rarity) => (
                  <TouchableOpacity
                    key={rarity}
                    className={`px-4 py-2 rounded-full border ${
                      filters.rarity.includes(rarity)
                        ? "bg-purple-100 border-purple-500"
                        : "bg-gray-100 border-gray-300"
                    }`}
                    onPress={() => addFilterTag("rarity", rarity)}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        filters.rarity.includes(rarity)
                          ? "text-purple-800"
                          : "text-gray-700"
                      }`}
                    >
                      {rarity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View className="mb-6">
              <Text className="text-gray-900 font-semibold text-base mb-3">
                Sort By
              </Text>
              <TouchableOpacity className="bg-gray-100 px-4 py-3 rounded-lg flex-row items-center justify-between">
                <Text className="text-gray-900">{filters.sortBy}</Text>
                <Text className="text-gray-500">▼</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Apply Filter Button */}
          <View className="px-4 py-4 border-t border-gray-200">
            <TouchableOpacity
              className="bg-green-500 rounded-lg py-4 items-center"
              onPress={handleApplyFilter}
            >
              <Text className="text-white font-semibold text-lg">
                Apply Filter
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
