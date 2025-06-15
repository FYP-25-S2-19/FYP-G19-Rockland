import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import ArticleCard from "../components/ArticleCard";
import FilterModal from "../components/FilterModal";
import BottomTabBar from "../components/BottomTabBar";


export default function MapsScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Maps Screen</Text>
    </View>
  );
}