import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import SearchIcon from "../../assets/images/search.svg";
import FilterIcon from "../../assets/images/filter.svg";
import BackIcon from "../../assets/images/back.svg";

// Import your sampleArticles data
import { sampleArticles } from "../../data/article";

export default function AllArticlesScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");

  const filteredArticles = sampleArticles.filter((article) =>
    article.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text style={styles.header}>My Articles</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <SearchIcon width={20} height={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => alert("Filter pressed")}>
          <FilterIcon width={20} height={20} fill="#000" />
        </TouchableOpacity>
      </View>

      {filteredArticles.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.fullCard}
          onPress={() =>
            router.push({
              pathname: "/expert/article/[id]",
              params: { id: article.id.toString() },
            })
          }
          activeOpacity={0.8}
        >
          <Image source={article.thumbnail} style={styles.fullCardImage} />
          <Text
            style={styles.fullCardTitle}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {article.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 2,
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#000",
    paddingHorizontal: 16,
    height: 48,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 0,
  },
  filterButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullCard: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f8f8f8",
    overflow: "hidden",
    minHeight: 250, // Fixed min height to make cards same height
    justifyContent: "space-between",
  },
  fullCardImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  fullCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 12,
    color: "#000",
  },
});
