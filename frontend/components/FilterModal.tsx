import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from "react-native";
import BackIcon from "../assets/images/back.svg";

export default function FilterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selectedCategories, setSelectedCategories] = useState(["Beginner", "Fossils"]);
  const [sortBy, setSortBy] = useState("Sort by Most Liked");

  const categories = ["Beginner", "Fossils", "Intermediate", "Mineral & Crystal", "Advanced", "Geology"];

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat !== category));
  };

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories(prev => [...prev, category]);
    }
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSortBy("Sort by Most Liked");
  };

  const handleApply = () => {
    console.log("Apply filters:", { selectedCategories, sortBy });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={onClose}><BackIcon width={24} height={24} /></TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Filter</Text>
          <TouchableOpacity onPress={handleReset}><Text className="text-green-600 font-medium">Reset</Text></TouchableOpacity>
        </View>

        <ScrollView className="px-4 flex-1">
          {/* Selected */}
          <View className="my-5">
            <Text className="text-lg font-semibold mb-3">Categories</Text>
            <View className="flex-row flex-wrap gap-2">
              {selectedCategories.map((category, index) => (
                <View key={index} className="flex-row items-center bg-green-600 px-3 py-2 rounded-full">
                  <Text className="text-white text-sm font-medium mr-1">{category}</Text>
                  <TouchableOpacity onPress={() => removeCategory(category)}>
                    <Text className="text-white text-lg font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Add Categories */}
          <View className="my-5">
            <Text className="text-lg font-semibold mb-3">Add Categories</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories.filter(cat => !selectedCategories.includes(cat)).map((category, index) => (
                <TouchableOpacity key={index} onPress={() => addCategory(category)} className="bg-gray-100 px-3 py-2 rounded-full">
                  <Text className="text-sm text-gray-600 font-medium">{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort */}
          <View className="my-5">
            <Text className="text-lg font-semibold mb-3">Sort</Text>
            <TouchableOpacity className="flex-row justify-between items-center bg-gray-100 px-4 py-3 rounded-lg">
              <Text className="text-base text-gray-900">{sortBy}</Text>
              <Text className="text-sm text-gray-500">▼</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View className="p-4 border-t border-gray-200">
          <TouchableOpacity onPress={handleApply} className="bg-green-600 py-4 rounded-lg items-center">
            <Text className="text-white text-lg font-semibold">Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
