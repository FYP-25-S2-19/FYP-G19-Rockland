"use client"

import { useState } from "react"
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from "react-native"

// Article Card Component
const ArticleCard = ({ article }: { article: any }) => {
  const handleLike = () => {
    console.log("Like pressed for:", article.title)
  }

  const handleArticlePress = () => {
    console.log("Article pressed:", article.title)
  }

  return (
    <TouchableOpacity style={styles.articleCard} onPress={handleArticlePress} activeOpacity={0.8}>
      {/* Author Section */}
      <View style={styles.authorSection}>
        <Image source={{ uri: article.authorImage }} style={styles.authorImage} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{article.authorName}</Text>
          <View style={[styles.badge, article.isPremium ? styles.premiumBadge : styles.freeBadge]}>
            <Text style={[styles.badgeText, article.isPremium ? styles.premiumBadgeText : styles.freeBadgeText]}>
              {article.isPremium ? "Premium" : "Free"}
            </Text>
          </View>
        </View>
      </View>

      {/* Article Content */}
      <View style={styles.articleContent}>
        <Image source={{ uri: article.thumbnail }} style={styles.articleThumbnail} />
        <View style={styles.articleText}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{article.category}</Text>
          </View>
          <Text style={styles.previewText}>{article.preview}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.articleFooter}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike} activeOpacity={0.7}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.likeCount}>{article.likes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

// Filter Modal Component
const FilterModal = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const [selectedCategories, setSelectedCategories] = useState(["Beginner", "Fossils"])
  const [sortBy, setSortBy] = useState("Sort by Most Liked")

  const categories = ["Beginner", "Fossils", "Intermediate", "Mineral & Crystal", "Advanced", "Geology"]

  const removeCategory = (category: string) => {
    setSelectedCategories((prev) => prev.filter((cat) => cat !== category))
  }

  const addCategory = (category: string) => {
    if (!selectedCategories.includes(category)) {
      setSelectedCategories((prev) => [...prev, category])
    }
  }

  const handleReset = () => {
    setSelectedCategories([])
    setSortBy("Sort by Most Liked")
  }

  const handleApply = () => {
    console.log("Apply filters:", { selectedCategories, sortBy })
    onClose()
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filter</Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Selected Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.selectedCategories}>
              {selectedCategories.map((category, index) => (
                <View key={index} style={styles.selectedCategoryTag}>
                  <Text style={styles.selectedCategoryText}>{category}</Text>
                  <TouchableOpacity onPress={() => removeCategory(category)} activeOpacity={0.7}>
                    <Text style={styles.removeIcon}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Available Categories */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Add Categories</Text>
            <View style={styles.availableCategories}>
              {categories
                .filter((cat) => !selectedCategories.includes(cat))
                .map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.availableCategoryTag}
                    onPress={() => addCategory(category)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.availableCategoryText}>{category}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Sort Dropdown */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Sort</Text>
            <TouchableOpacity style={styles.dropdown} activeOpacity={0.7}>
              <Text style={styles.dropdownText}>{sortBy}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
            <Text style={styles.applyButtonText}>Apply Filter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

// Main Feed Screen Component
export default function FeedScreen() {
  const [activeTab, setActiveTab] = useState("Articles")
  const [searchText, setSearchText] = useState("")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState("Feed")
  const router = useRouter();

  const sampleArticles = [
    {
      id: 1,
      authorName: "Song Kim",
      authorImage: "/placeholder.svg?height=40&width=40",
      isPremium: false,
      thumbnail: "/placeholder.svg?height=120&width=160",
      title: "What are the type of geological rocks?",
      category: "Beginner",
      preview: "Discover the three main types of rocks and how they form through different geological processes...",
      likes: "1.5k",
    },
    {
      id: 2,
      authorName: "Dr. Sarah Johnson",
      authorImage: "/placeholder.svg?height=40&width=40",
      isPremium: true,
      thumbnail: "/placeholder.svg?height=120&width=160",
      title: "Advanced Mineral Identification Techniques",
      category: "Advanced",
      preview: "Learn professional methods for identifying minerals using optical properties and chemical tests...",
      likes: "892",
    },
    {
      id: 3,
      authorName: "Mike Chen",
      authorImage: "/placeholder.svg?height=40&width=40",
      isPremium: false,
      thumbnail: "/placeholder.svg?height=120&width=160",
      title: "Fossil Hunting: A Beginner's Guide",
      category: "Fossils",
      preview: "Everything you need to know to start your fossil hunting journey, from tools to locations...",
      likes: "2.1k",
    },
  ]

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

  const handleBottomTabPress = (tab: string) => {
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
  }

  const handleSubscribe = () => {
    console.log("Subscribe pressed")
  }

  const handleFilter = () => {
    setFilterModalVisible(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search articles, discussions..."
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={handleFilter} activeOpacity={0.7}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Articles" && styles.activeTab]}
          onPress={() => handleTabPress("Articles")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "Articles" && styles.activeTabText]}>Articles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "Discussions" && styles.activeTab]}
          onPress={() => handleTabPress("Discussions")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "Discussions" && styles.activeTabText]}>Discussions</Text>
        </TouchableOpacity>
      </View>

      {/* Subscribe Banner */}
      <TouchableOpacity style={styles.subscribeBanner} onPress={handleSubscribe} activeOpacity={0.8}>
        <Text style={styles.crownIcon}>👑</Text>
        <Text style={styles.subscribeText}>Subscribe Now to Unlock Full Articles</Text>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>

      {/* Articles List */}
      <FlatList
        data={sampleArticles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ArticleCard article={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.articlesList}
      />

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        {["Home", "Feed", "Scan", "Maps", "Account"].map((tab, index) => {
          const icons = ["🏠", "📰", "📷", "🗺️", "👤"]
          const isActive = activeBottomTab === tab

          return (
            <TouchableOpacity
              key={index}
              style={styles.bottomTab}
              onPress={() => handleBottomTabPress(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.bottomTabIcon, isActive && styles.activeBottomTabIcon]}>{icons[index]}</Text>
              <Text style={[styles.bottomTabLabel, isActive && styles.activeBottomTabLabel]}>{tab}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Filter Modal */}
      <FilterModal visible={filterModalVisible} onClose={() => setFilterModalVisible(false)} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
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
  filterButton: {
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
  },
  filterIcon: {
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#16a34a",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#16a34a",
    fontWeight: "600",
  },
  subscribeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbbf24",
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  crownIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  subscribeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  arrowIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  articlesList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  articleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadge: {
    backgroundColor: "#e5e7eb",
  },
  premiumBadge: {
    backgroundColor: "#fbbf24",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  freeBadgeText: {
    color: "#6b7280",
  },
  premiumBadgeText: {
    color: "#ffffff",
  },
  articleContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  articleThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  articleText: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "500",
  },
  previewText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  articleFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  heartIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  likeCount: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  bottomTabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 8,
    paddingBottom: 20,
  },
  bottomTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  bottomTabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeBottomTabIcon: {
    opacity: 1,
  },
  bottomTabLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeBottomTabLabel: {
    color: "#16a34a",
    fontWeight: "600",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backIcon: {
    fontSize: 24,
    color: "#1f2937",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  resetButton: {
    fontSize: 16,
    color: "#16a34a",
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  selectedCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedCategoryTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedCategoryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  removeIcon: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  availableCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  availableCategoryTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  availableCategoryText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  applyButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
})