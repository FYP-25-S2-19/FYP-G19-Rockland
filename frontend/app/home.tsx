import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    console.log("Search:", searchText);
  };

  const handleUnlockFeatures = () => {
    console.log("Unlock features pressed");
  };

  const handleTakeQuiz = () => {
    console.log("Take Quiz pressed");
  };

  const handleLeaderboard = () => {
    console.log("Leaderboard pressed");
  };

  const handleTabPress = (tab: string) => {
    switch (tab) {
      case "Home":
        router.push("/home"); // or '/' if it's index.tsx
        break;
      case "Feed":
        router.push("/feed");
        break;
      case "Scan":
        router.push("/scan");
        break;
      case "Maps":
        router.push("/maps");
        break;
      case "Account":
        router.push("/account");
        break;
      default:
        break;
    }
  };

  const handleArticlePress = (article: string) => {
    console.log(`Article pressed: ${article}`);
  };

  const rocks = [
    {
      id: 1,
      name: "Bedrock",
      category: "Igneous Rock",
      rarity: "Common",
      image: { uri: "https://via.placeholder.com/48" },
    },
    {
      id: 2,
      name: "Bedcover",
      category: "Igneous Rock",
      rarity: "Rare",
      image: { uri: "https://via.placeholder.com/48" },
    },
    {
      id: 3,
      name: "Bedcover",
      category: "Igneous Rock",
      rarity: "Legendary",
      image: { uri: "https://via.placeholder.com/48" },
    },
  ];

  const filteredRocks = rocks.filter((rock) =>
    rock.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>ROCKLAND</Text>
          <Text style={styles.subtitle}>#1 Rock Learning Platform</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search rocks, minerals..."
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Unlock Features Button */}
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={handleUnlockFeatures}
          activeOpacity={0.8}
        >
          <Text style={styles.crownIcon}>👑</Text>
          <Text style={styles.unlockButtonText}>
            Tap to unlock full features
          </Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        {/* Quiz and Leaderboard Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={handleTakeQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.greenButtonText}>Take Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.greenButton}
            onPress={handleLeaderboard}
            activeOpacity={0.8}
          >
            <Text style={styles.greenButtonText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Popular on Rockland */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular on Rockland</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
            <View style={styles.gridItem} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rock Results</Text>
          {filteredRocks.map((rock, index) => (
            <TouchableOpacity
              key={rock.id}
              style={[styles.rockItem, index === 0 && styles.highlightedRock]}
              activeOpacity={0.8}
            >
              <Image source={rock.image} style={styles.rockImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rockName}>{rock.name}</Text>
                <Text style={styles.rockCategory}>
                  Category: {rock.category}
                </Text>
              </View>
              <View
                style={[
                  styles.rarityBadge,
                  rock.rarity === "Rare" && { backgroundColor: "#10b981" },
                  rock.rarity === "Legendary" && { backgroundColor: "#f59e0b" },
                ]}
              >
                <Text style={styles.rarityText}>{rock.rarity}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Articles</Text>
          <View style={styles.articlesContainer}>
            <TouchableOpacity
              style={styles.articleCard}
              onPress={() => handleArticlePress("geological rocks")}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: "/placeholder.svg?height=120&width=160" }}
                style={styles.articleImage}
                resizeMode="cover"
              />
              <Text style={styles.articleCaption}>
                What are the type of geological rocks?
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.articleCard}
              onPress={() => handleArticlePress("rock formation")}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: "/placeholder.svg?height=120&width=160" }}
                style={styles.articleImage}
                resizeMode="cover"
              />
              <Text style={styles.articleCaption}>
                How do sedimentary rocks form?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("Home")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("Feed")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📰</Text>
          <Text style={styles.tabLabel}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("Scan")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📷</Text>
          <Text style={styles.tabLabel}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("Maps")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>🗺️</Text>
          <Text style={styles.tabLabel}>Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress("Account")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#3b82f6",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  unlockButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  crownIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  unlockButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  greenButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  greenButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
    aspectRatio: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  articlesContainer: {
    flexDirection: "row",
    gap: 16,
  },
  articleCard: {
    flex: 1,
  },
  articleImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  articleCaption: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
    paddingBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },

  rockItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  highlightedRock: {
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  rockImage: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 6,
  },
  rockName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  rockCategory: {
    fontSize: 14,
    color: "#6b7280",
  },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#9ca3af", // default for Common
    borderRadius: 16,
  },
  rarityText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "500",
  },
});
