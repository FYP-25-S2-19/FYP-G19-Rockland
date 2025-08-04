import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";

type Props = {
  visible: boolean;
  onClose: () => void;
  currentSort: "asc" | "desc";
  onApply: (sort: "asc" | "desc") => void;
};

export default function FilterModalDiscussion({
  visible,
  onClose,
  currentSort,
  onApply,
}: Props) {
  const [sortBy, setSortBy] = useState<"asc" | "desc">(currentSort);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      setSortBy(currentSort);
      setShowSortDropdown(false);
    }
  }, [visible]);

  const handleApply = () => {
    onApply(sortBy);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-2xl w-full max-h-[60%] overflow-hidden">
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={onClose}>
                <BackIcon width={20} height={20} />
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">Sort</Text>
              <View style={{ width: 20 }} />
            </View>

            {/* Sort Section */}
            <View className="px-4 my-5">
              <Text className="text-lg font-semibold mb-3">Sort By</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                onPress={() => setShowSortDropdown((prev) => !prev)}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-base text-gray-900">
                    {sortBy === "desc" ? "Newest First" : "Oldest First"}
                  </Text>
                  <ChevronDownIcon width={18} height={18} />
                </View>
              </TouchableOpacity>

              {showSortDropdown && (
                <View className="mt-2 bg-white border border-gray-200 rounded-lg">
                  {[
                    { label: "Newest First", value: "desc" },
                    { label: "Oldest First", value: "asc" },
                  ].map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSortBy(option.value as "asc" | "desc");
                        setShowSortDropdown(false);
                      }}
                      className={`px-4 py-2 ${
                        sortBy === option.value ? "bg-green-600" : ""
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          sortBy === option.value
                            ? "font-semibold text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

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
