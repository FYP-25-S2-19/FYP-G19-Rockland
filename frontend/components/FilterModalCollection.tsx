import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BackIcon from "../assets/images/back.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";

const rarities = ["Common", "Rare", "Legendary"] as const;
export type Rarity = (typeof rarities)[number];

export default function FilterModalMyCollection({
  visible,
  onClose,
  onApply,
  defaultValues,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    rarities: Rarity[];
    locations: string[];
    startDate: Date | null;
    endDate: Date | null;
    sortOption: string;
  }) => void;
  defaultValues: {
    rarities: Rarity[];
    locations: string[];
    startDate: Date | null;
    endDate: Date | null;
    sortOption: string;
  };
}) {
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Most Recent");
  const [locationSearch, setLocationSearch] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const sortOptions = ["Most Recent", "Earliest", "Rarity", "A-Z", "Z-A"];

  const locations = [
    "Mount Rushmore",
    "Sierra Nevada",
    "Scotland",
    "Iceland",
    "Grand Canyon",
    "Hawaii",
    "Indiana",
    "Egypt",
    "France",
    "Columbia River Plateau",
    "Appalachian Mountains",
    "South Dakota",
    "Brazil",
  ];

  useEffect(() => {
    setSelectedRarities(defaultValues.rarities || []);
    setSelectedLocations(defaultValues.locations || []);
    setStartDate(defaultValues.startDate || null);
    setEndDate(defaultValues.endDate || null);
    setSortBy(defaultValues.sortOption || "Most Recent");
  }, [defaultValues, visible]);

  function toggleSelection<T extends string>(
    item: T,
    list: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  }

  const handleApply = () => {
    onApply({
      rarities: selectedRarities,
      locations: selectedLocations,
      startDate,
      endDate,
      sortOption: sortBy,
    });
  };

  const handleReset = () => {
    setSelectedRarities([]);
    setSelectedLocations([]);
    setStartDate(null);
    setEndDate(null);
    setSortBy("Most Recent");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-2xl w-full h-[85%]">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={onClose}>
                <BackIcon width={20} height={20} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">Filter</Text>
              <TouchableOpacity onPress={handleReset}>
                <Text className="text-green-600 font-medium">Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 40 }}>
              {/* Rarity */}
              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Rarity</Text>
                <View className="flex-row flex-wrap gap-3">
                  {rarities.map((rarity) => (
                    <TouchableOpacity
                      key={rarity}
                      onPress={() => toggleSelection(rarity, selectedRarities, setSelectedRarities)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedRarities.includes(rarity)
                          ? "bg-green-600 border-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedRarities.includes(rarity) ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {rarity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Location */}
              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Location</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  onPress={() => setShowLocationDropdown((prev) => !prev)}
                >
                  <View className="flex-row flex-wrap items-center justify-between">
                    <View className="flex-row flex-wrap gap-2 flex-1">
                      {selectedLocations.length > 0 ? (
                        selectedLocations.map((item, index) => (
                          <View
                            key={index}
                            className="flex-row items-center bg-green-600 px-2.5 py-1.5 rounded-[6px]"
                          >
                            <Text className="text-white font-semibold text-sm mr-2">{item}</Text>
                            <TouchableOpacity
                              onPress={() => toggleSelection(item, selectedLocations, setSelectedLocations)}
                            >
                              <Text className="text-sm font-bold text-white">×</Text>
                            </TouchableOpacity>
                          </View>
                        ))
                      ) : (
                        <Text className="text-gray-400">Select locations</Text>
                      )}
                    </View>
                    <ChevronDownIcon width={18} height={18} />
                  </View>
                </TouchableOpacity>

                {showLocationDropdown && (
                  <View className="mt-2 border border-gray-200 rounded-lg bg-white">
                    <TextInput
                      placeholder="Search location..."
                      value={locationSearch}
                      onChangeText={setLocationSearch}
                      className="border-b border-gray-200 px-4 py-2 text-base"
                      placeholderTextColor="#9ca3af"
                    />
                    <ScrollView style={{ maxHeight: 160 }}>
                      {[...selectedLocations, ...locations.filter((i) => !selectedLocations.includes(i))]
                        .filter((loc) => loc.toLowerCase().includes(locationSearch.toLowerCase()))
                        .map((loc, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => toggleSelection(loc, selectedLocations, setSelectedLocations)}
                            className={`px-4 py-2 ${selectedLocations.includes(loc) ? "bg-green-600" : ""}`}
                          >
                            <Text
                              className={`text-base ${
                                selectedLocations.includes(loc)
                                  ? "text-white font-semibold"
                                  : "text-gray-800"
                              }`}
                            >
                              {loc}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Collected Date */}
              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Collected Date</Text>
                <View className="flex-row justify-between gap-4">
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  >
                    <Text className="text-base text-gray-800">
                      {startDate ? startDate.toLocaleDateString() : "Start Date"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg"
                  >
                    <Text className="text-base text-gray-800">
                      {endDate ? endDate.toLocaleDateString() : "End Date"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {showStartPicker && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowStartPicker(false);
                      if (date) setStartDate(date);
                    }}
                  />
                )}
                {showEndPicker && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                      setShowEndPicker(false);
                      if (date) setEndDate(date);
                    }}
                  />
                )}
              </View>

              {/* Sort By */}
              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Sort By</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-800 text-base">{sortBy}</Text>
                    <ChevronDownIcon width={18} height={18} />
                  </View>
                </TouchableOpacity>
                {showSortDropdown && (
                  <View className="mt-2 bg-white border border-gray-200 rounded-lg">
                    {sortOptions.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          setSortBy(option);
                          setShowSortDropdown(false);
                        }}
                        className={`px-4 py-2 ${sortBy === option ? "bg-green-600" : ""}`}
                      >
                        <Text
                          className={`text-base ${
                            sortBy === option ? "text-white font-semibold" : "text-gray-700"
                          }`}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleApply}
                className="bg-green-600 py-4 rounded-lg items-center mt-4"
              >
                <Text className="text-white text-lg font-semibold">Apply Filter</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
