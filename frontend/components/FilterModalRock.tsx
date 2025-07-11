import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";
import axios from "axios";

export default function FilterModalRock({
  visible,
  onClose,
  onApply,
  defaultValues,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    types: string[];
    rarities: string[];
    locations: string[];
    sortOption: string;
  }) => void;
  defaultValues: {
    types: string[];
    rarities: string[];
    locations: string[];
    sortOption: string;
  };
}) {

  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Sort by A-Z");

  const [rockTypes, setRockTypes] = useState<string[]>([]);
  const [rarities, setRarities] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");

  const sortOptions = [
    "Sort by A-Z",
    "Sort by Z-A",
    "Sort by Most Commented",
    "Sort by Rarity",
  ];

  useEffect(() => {
    if (visible) {
      setSelectedTypes(defaultValues.types || []);
      setSelectedRarities(defaultValues.rarities || []);
      setSelectedLocations(defaultValues.locations || []);
      setSortBy(defaultValues.sortOption || "Sort by A-Z");
      fetchFilterData();
    }
  }, [defaultValues, visible]);

  const fetchFilterData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/rocks/filter-options`);
      if (res.data.success) {
        setRockTypes(res.data.data.types || []);
        setRarities(res.data.data.rarities || []);
        setLocations(res.data.data.locations || []);
      }
    } catch (err) {
      console.error("Failed to fetch filter data", err);
    }
  };

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (val: string[]) => void
  ) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleReset = () => {
    setSelectedTypes([]);
    setSelectedRarities([]);
    setSelectedLocations([]);
    setSortBy("Sort by A-Z");
  };

  const handleApply = () => {
    onApply({
      types: selectedTypes,
      rarities: selectedRarities,
      locations: selectedLocations,
      sortOption: sortBy,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-2xl w-full h-[90%]">
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
              className="flex-1"
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
                <TouchableOpacity onPress={onClose}>
                  <BackIcon width={20} height={20} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">Filter</Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text className="text-green-600 font-medium">Reset</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                className="px-4"
                nestedScrollEnabled
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Rock Type */}
                <View className="my-5">
                  <Text className="text-lg font-semibold mb-3">Rock Type</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                  >
                    <View className="flex-row flex-wrap items-center justify-between">
                      <View className="flex-row flex-wrap gap-2 flex-1">
                        {selectedTypes.length > 0 ? (
                          selectedTypes.map((item, index) => (
                            <View
                              key={index}
                              className="flex-row items-center bg-green-600 px-2.5 py-1.5 rounded-[6px]"
                            >
                              <Text className="text-white font-semibold text-sm mr-2">{item}</Text>
                              <TouchableOpacity
                                onPress={() =>
                                  toggleSelection(item, selectedTypes, setSelectedTypes)
                                }
                              >
                                <Text className="text-sm font-bold text-white">×</Text>
                              </TouchableOpacity>
                            </View>
                          ))
                        ) : (
                          <Text className="text-gray-400">Select rock types</Text>
                        )}
                      </View>
                      <ChevronDownIcon width={18} height={18} />
                    </View>
                  </TouchableOpacity>
                  {showTypeDropdown && (
                    <View className="border border-gray-300 rounded-lg mt-2 bg-white max-h-40">
                      <ScrollView nestedScrollEnabled>
                        {rockTypes.map((type, index) => (
                          <TouchableOpacity
                            key={index}
                            className={`px-4 py-2 ${
                              selectedTypes.includes(type) ? "bg-green-600" : ""
                            }`}
                            onPress={() =>
                              toggleSelection(type, selectedTypes, setSelectedTypes)
                            }
                          >
                            <Text
                              className={`text-base ${
                                selectedTypes.includes(type)
                                  ? "text-white font-semibold"
                                  : "text-gray-800"
                              }`}
                            >
                              {type}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Rarity */}
                <View className="my-5">
                  <Text className="text-lg font-semibold mb-3">Rarity</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {rarities.map((rarity) => (
                      <TouchableOpacity
                        key={rarity}
                        onPress={() =>
                          toggleSelection(rarity, selectedRarities, setSelectedRarities)
                        }
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
                          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
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
                    onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                  >
                    <View className="flex-row flex-wrap items-center justify-between">
                      <View className="flex-row flex-wrap gap-2 flex-1">
                        {selectedLocations.length > 0 ? (
                          selectedLocations.map((item, index) => (
                            <View
                              key={`${item}-${index}`} // make key more unique
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
                      <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                        {[...selectedLocations, ...locations.filter(i => !selectedLocations.includes(i))]
                          .filter((loc) =>
                            loc.toLowerCase().includes(locationSearch.toLowerCase())
                          )
                          .map((loc, index) => (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                toggleSelection(loc, selectedLocations, setSelectedLocations)
                              }
                              className={`px-4 py-2 ${
                                selectedLocations.includes(loc) ? "bg-green-600" : ""
                              }`}
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

                {/* Sort */}
                <View className="my-5">
                  <Text className="text-lg font-semibold mb-3">Sort</Text>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    onPress={() => setShowSortDropdown((prev) => !prev)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-900">{sortBy}</Text>
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
                          className={`px-4 py-2 ${
                            sortBy === option ? "bg-green-600" : ""
                          }`}
                        >
                          <Text
                            className={`text-base ${
                              sortBy === option
                                ? "text-white font-semibold"
                                : "text-gray-700"
                            }`}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View className="mt-6 border-t border-gray-200 pt-4 pb-8">
                  <TouchableOpacity
                    onPress={handleApply}
                    className="bg-green-600 py-4 rounded-lg items-center"
                  >
                    <Text className="text-white text-lg font-semibold">Apply Filter</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
