import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../../assets/images/back.svg";
import { sampleArticles } from "../../../data/article";

export default function ExpertArticleDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    async function checkUserRoleAndLoadArticle() {
      const role = await AsyncStorage.getItem("userRole");
      if (role !== "expert") {
        router.replace(`/article/${id}`);
        return;
      }

      const foundArticle = sampleArticles.find((a) => a.id.toString() === id);
      if (foundArticle) {
        setArticle(foundArticle);
      } else {
        setArticle(null);
      }
      setLoading(false);
    }
    checkUserRoleAndLoadArticle();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#459B6C" />
        <Text style={{ marginTop: 10 }}>Loading article...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text>Article not found.</Text>
      </View>
    );
  }

  const handleEdit = () => {
    setMenuVisible(false);
    router.push({
      pathname: "/expert/article/edit/[id]",
      params: { id: article.id.toString() },
    });
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    setConfirmVisible(false);
    Alert.alert("Deleted", "The article has been deleted.");
    router.back();
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  const getAccessBadgeStyle = (accessType?: string) => {
    if (!accessType) return styles.freeBadge;
    switch (accessType.toLowerCase()) {
      case "free":
        return styles.freeBadge;
      case "premium":
        return styles.premiumBadge;
      default:
        return styles.freeBadge;
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper} activeOpacity={0.7}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconWrapper} activeOpacity={0.7}>
            <Text style={styles.menuButton}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Author & Access */}
        <View style={styles.profileRow}>
          <Text style={styles.profileName}>{article.authorName || article.author}</Text>
          <Text style={styles.timeText}>{article.date || article.timestamp}</Text>
          <View style={[styles.accessBadge, getAccessBadgeStyle(article.isPremium ? "premium" : "free")]}>
            <Text style={styles.accessText}>{article.isPremium ? "PREMIUM" : "FREE"}</Text>
          </View>
        </View>

        {/* Title + Level */}
        <View style={styles.titleRow}>
          <Text style={styles.articleTitle}>{article.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{(article.category || article.level || "beginner").toUpperCase()}</Text>
          </View>
        </View>

        {/* Image */}
        <Image source={article.thumbnail || article.image} style={styles.articleImage} />

        {/* Description */}
        <Text style={styles.descriptionText}>{article.preview || article.description}</Text>
      </ScrollView>

      {/* Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="slide" onRequestClose={() => setMenuVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={styles.menuContainer}>
          <View style={styles.bottomMenu}>
            <TouchableOpacity onPress={handleEdit} style={styles.menuItem} activeOpacity={0.7}>
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeletePress} style={styles.menuItem} activeOpacity={0.7}>
              <Text style={styles.menuText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={handleCancelDelete}>
        <TouchableWithoutFeedback onPress={handleCancelDelete}>
          <View style={styles.confirmOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmTitle}>Confirm Delete</Text>
          <Text style={styles.confirmMessage}>Are you sure you want to remove this article?</Text>
          <View style={styles.confirmButtonsRow}>
            <TouchableOpacity
              style={[styles.confirmButton, styles.deleteButton]}
              onPress={handleConfirmDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, styles.cancelButton]}
              onPress={handleCancelDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  container: { paddingHorizontal: 20, paddingTop: 30 },
  topBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  iconWrapper: { padding: 8 },
  backButton: { fontSize: 28, color: "#000" },
  menuButton: { fontSize: 28, color: "#000" },

  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  profileName: { fontSize: 16, fontWeight: "bold", color: "#000", flex: 1 },
  timeText: { fontSize: 12, color: "#888", marginRight: 12 },
  accessBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  freeBadge: { backgroundColor: "#4CAF50" },
  premiumBadge: { backgroundColor: "#FFB300" },
  accessText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  articleTitle: { fontSize: 24, fontWeight: "bold", color: "#000", flex: 1 },
  levelBadge: {
    backgroundColor: "#6B4C3B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 8,
  },
  levelText: { color: "#fff", fontWeight: "bold", fontSize: 12 },

  articleImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
  },

  descriptionText: { fontSize: 16, color: "#333", lineHeight: 22, marginBottom: 30 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomMenu: {
    backgroundColor: "#F1E8F4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  menuItem: { paddingVertical: 10 },
  menuText: { color: "#853E7E", fontSize: 16, fontWeight: "bold", textAlign: "left" },

  confirmOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  confirmContainer: {
    position: "absolute",
    top: "40%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 12, color: "#000" },
  confirmMessage: { fontSize: 16, color: "#555", marginBottom: 24, textAlign: "center" },
  confirmButtonsRow: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: { backgroundColor: "#CA3032" },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  cancelButton: { backgroundColor: "#EAF7FF" },
  cancelButtonText: { color: "#222", fontWeight: "bold", fontSize: 16 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
