import { View, Text, TouchableOpacity, Animated, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import React, { useEffect, useRef } from "react";

// Icon imports
import HomeIcon from "../assets/icons/home.svg";
import HomeIconActive from "../assets/icons/home_active.svg";
import FeedIcon from "../assets/icons/feed.svg";
import FeedIconActive from "../assets/icons/feed_active.svg";
import ScanIcon from "../assets/icons/scan.svg";
import ScanIconActive from "../assets/icons/scan_active.svg";
import MapsIcon from "../assets/icons/map.svg";
import MapsIconActive from "../assets/icons/map_active.svg";
import AccountIcon from "../assets/icons/account.svg";
import AccountIconActive from "../assets/icons/account_active.svg";

const tabs = ["Home", "Feed", "Scan", "Maps", "Account"] as const;

const routes = {
  Home: "/home",
  Feed: "/feed",
  Scan: "/scan",
  Maps: "/maps",
  Account: "/account",
} as const;

type TabName = keyof typeof routes;

const icons = {
  Home: { default: HomeIcon, active: HomeIconActive },
  Feed: { default: FeedIcon, active: FeedIconActive },
  Scan: { default: ScanIcon, active: ScanIconActive },
  Maps: { default: MapsIcon, active: MapsIconActive },
  Account: { default: AccountIcon, active: AccountIconActive },
};

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = pathname.replace("/(tabs)", "").replace("/", "");

  return (
    <View
      className="flex-row justify-between bg-white px-4 pb-5 pt-2 border-t border-gray-200"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.toLowerCase();
        const isCenter = tab === "Scan";

        const Icon = isActive ? icons[tab].active : icons[tab].default;

        const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
        const bumpAnim = useRef(new Animated.Value(isActive ? (isCenter ? -20 : -10) : 0)).current;

        useEffect(() => {
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: isActive ? 1.2 : 1,
              useNativeDriver: true,
              friction: 4,
            }),
            Animated.spring(bumpAnim, {
              toValue: isActive ? (isCenter ? -20 : -10) : 0,
              useNativeDriver: true,
              friction: 6,
            }),
          ]).start();
        }, [isActive]);

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => router.push(routes[tab])}
            activeOpacity={0.8}
            className="items-center"
          >
            <Animated.View
              style={{
                transform: [{ translateY: bumpAnim }, { scale: scaleAnim }],
                marginTop: isActive ? (isCenter ? -20 : -10) : 0,
                shadowColor: isActive ? "#000" : undefined,
                shadowOffset: isActive ? { width: 0, height: 3 } : undefined,
                shadowOpacity: isActive ? 0.15 : 0,
                shadowRadius: isActive ? 6 : 0,
                elevation: isActive ? 6 : 0,
              }}
              className={`w-14 h-14 rounded-[22px] items-center justify-center ${
                isActive ? "bg-[#459B6C]" : ""
              }`}
            >
              <Icon width={28} height={28} />
            </Animated.View>
            <Text
              className={`text-sm mt-1 ${
                isActive ? "text-[#459B6C] font-bold" : "text-gray-500 font-medium"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
