import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import ArticleCard from "../components/ArticleCard";
import FilterModal from "../components/FilterModal";
import BottomTabBar from "../components/BottomTabBar";

export default function FeedScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState("Feed");

  const sampleArticles = [
    {
      id: 1, authorName: "Song Kim", authorImage: "/placeholder.svg?height=40&width=40", isPremium: false,
      thumbnail: "/placeholder.svg?height=120&width=160", title: "What are the type of geological rocks?", category: "Beginner",
      preview: "Discover the three main types of rocks...", likes: "1.5k"
    },
    {
      id: 2, authorName: "Dr. Sarah Johnson", authorImage: "/placeholder.svg?height=40&width=40", isPremium: true,
      thumbnail: "/placeholder.svg?height=120&width=160", title: "Advanced Mineral Identification", category: "Advanced",
      preview: "Learn professional methods for identifying minerals...", likes: "892"
    },
    {
      id: 3, authorName: "Mike Chen", authorImage: "/placeholder.svg?height=40&width=40", isPremium: false,
      thumbnail: "/placeholder.svg?height=120&width=160", title: "Fossil Hunting Guide", category: "Fossils",
      preview: "Everything you need to start your fossil hunting...", likes: "2.1k"
    }
  ];

  const handleFilter = () => setFilterModalVisible(true);
  const handleSubscribe = () => console.log("Subscribe pressed");

  // Safe routes mapping (this fixes the router.push typescript error)
  const routes = {
    Home: '/home',
    Feed: '/feed',
    Scan: '/scan',
    Maps: '/maps',
    Account: '/account',
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Search */}
      <View className="flex-row px-4 py-3 items-center">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mr-3">
          <Text className="text-lg mr-3">🔍</Text>
          <TextInput
            className="flex-1 text-base text-gray-800"
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search articles..."
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity onPress={handleFilter} className="p-3 bg-gray-100 rounded-xl">
          <Text className="text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Subscribe Banner */}
      <TouchableOpacity onPress={handleSubscribe} className="flex-row bg-yellow-400 mx-4 p-4 rounded-xl mb-4 items-center">
        <Text className="text-lg mr-3">👑</Text>
        <Text className="flex-1 text-base font-semibold text-white">Subscribe Now to Unlock Full Articles</Text>
        <Text className="text-lg text-white">→</Text>
      </TouchableOpacity>

      {/* Article List */}
      <FlatList
        data={sampleArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ArticleCard article={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />

      {/* Bottom Tab Bar */}
      <BottomTabBar activeTab="Feed" />

      <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
    </SafeAreaView>
  );
}
