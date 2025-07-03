import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";

export default function FilterModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [selectedCategories, setSelectedCategories] = useState([
    "Beginner",
    "Fossils",
  ]);
  const [sortBy, setSortBy] = useState("Sort by Most Liked");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortOptions = [
  "Sort by Most Liked",
  "Sort by Newest",
  "Sort by Oldest",];

  const categories = [
    "Beginner",
    "Fossils",
    "Intermediate",
    "Mineral & Crystal",
    "Advanced",
    "Geology",
  ];

  const removeCategory = (category: string) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
  };

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSortBy("Sort by Most Liked");
    setShowCategoryDropdown(false);
  };

  const handleApply = () => {
    console.log("Apply filters:", { selectedCategories, sortBy });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-2xl w-full max-h-[85%] overflow-hidden">
          <SafeAreaView>
            {/* Header */}
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
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Category Section */}
              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Categories</Text>

                {/* Dropdown Toggle */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                  onPress={() => setShowCategoryDropdown((prev) => !prev)}
                >
                  <View className="flex-row flex-wrap items-center justify-between">
                    <View className="flex-row flex-wrap gap-2 flex-1">
                      {selectedCategories.length > 0 ? (
                        selectedCategories.map((item, index) => (
                          <View
                            key={index}
                            className="flex-row items-center bg-green-600 px-2.5 py-1.5 rounded-[6px]"
                          >
                            <Text className="text-white font-semibold text-sm mr-2">
                              {item}
                            </Text>
                            <TouchableOpacity onPress={() => removeCategory(item)}>
                              <Text className="text-sm font-bold text-white">×</Text>
                            </TouchableOpacity>
                          </View>
                        ))
                      ) : (
                        <Text className="text-gray-400">Select categories</Text>
                      )}
                    </View>
                    <View className="ml-2">
                      <ChevronDownIcon width={18} height={18} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Dropdown List */}
                {showCategoryDropdown && (
                  <View className="border border-gray-300 rounded-lg mt-2 bg-white max-h-40">
                    <ScrollView
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                      style={{ maxHeight: 160 }}
                    >
                      {[...selectedCategories, ...categories.filter(i => !selectedCategories.includes(i))].map((category, index) => (
                        <TouchableOpacity
                          key={index}
                          className={`px-4 py-2 ${selectedCategories.includes(category) ? "bg-green-600" : ""}`}
                          onPress={() =>
                            selectedCategories.includes(category)
                              ? removeCategory(category)
                              : addCategory(category)
                          }
                        >
                          <Text className={`text-base ${selectedCategories.includes(category) ? "text-white font-semibold" : "text-gray-800"}`}>
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              <View className="my-5">
                <Text className="text-lg font-semibold mb-3">Sort</Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    onPress={() => setShowSortDropdown(prev => !prev)}
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
                        className={`px-4 py-2 ${sortBy === option ? "bg-green-600" : ""}`}
                      >
                        <Text className={`text-base ${sortBy === option ? "font-semibold text-white" : "text-gray-700"}`}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View className="p-4 border-t border-gray-200 bg-white">
              <TouchableOpacity
                onPress={handleApply}
                className="bg-green-600 py-4 rounded-lg items-center"
              >
                <Text className="text-white text-lg font-semibold">
                  Apply Filter
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
