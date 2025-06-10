"use client";

import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function AccountScreen() {
  const [activeBottomTab, setActiveBottomTab] = useState("Account");
  const router = useRouter();

  const handleSettings = () => {
    console.log("Settings pressed");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  const handleSubscribe = () => {
    console.log("Subscribe Now pressed");
  };

  const handleMyCollection = () => {
    console.log("My Collection pressed");
  };

  const handleSettingsNavigation = () => {
    console.log("Settings navigation pressed");
  };

  const handleBottomTabPress = (tab: string) => {
    setActiveBottomTab(tab);

    switch (tab) {
      case "Home":
        router.push("/home"); // or "/" if it's index.tsx
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarIcon}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Anna Kim</Text>
              <Text style={styles.userStatus}>Free User</Text>
            </View>
          </View>

          {/* Settings Icon */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.profileButtonText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation List */}
        <View style={styles.navigationList}>
          <TouchableOpacity
            style={styles.navigationItem}
            onPress={handleMyCollection}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationText}>My Collection</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigationItem}
            onPress={handleSettingsNavigation}
            activeOpacity={0.7}
          >
            <Text style={styles.navigationText}>Setting</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabBar}>
        {[
          { name: "Home", icon: "🏠" },
          { name: "Feed", icon: "📰" },
          { name: "Scan", icon: "📷" },
          { name: "Maps", icon: "🗺️" },
          { name: "Account", icon: "👤" },
        ].map((tab, index) => {
          const isActive = activeBottomTab === tab.name;

          return (
            <TouchableOpacity
              key={index}
              style={styles.bottomTab}
              onPress={() => handleBottomTabPress(tab.name)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.bottomTabIcon,
                  isActive && styles.activeBottomTabIcon,
                ]}
              >
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.bottomTabLabel,
                  isActive && styles.activeBottomTabLabel,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarIcon: {
    fontSize: 32,
    color: "#9ca3af",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userStatus: {
    fontSize: 14,
    color: "#6b7280",
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 40,
  },
  profileButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  profileButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  subscribeButton: {
    flex: 1,
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  navigationList: {
    flex: 1,
  },
  navigationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  navigationText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  arrowIcon: {
    fontSize: 20,
    color: "#9ca3af",
  },
  bottomTabBar: {
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
    opacity: 0.6,
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
});
