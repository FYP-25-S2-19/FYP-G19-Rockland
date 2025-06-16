import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FC } from "react";

// Import your SVG icons as components
import HomeIcon from "../assets/icons/home.svg";
import FeedIcon from "../assets/icons/feed.svg";
import ScanIcon from "../assets/icons/scan.svg";
import MapsIcon from "../assets/icons/map.svg";
import AccountIcon from "../assets/icons/account.svg";

type TabName = "Home" | "Feed" | "Scan" | "Maps" | "Account";

interface BottomTabBarProps {
  activeTab: TabName;
}

const tabs: TabName[] = ["Home", "Feed", "Scan", "Maps", "Account"];

const routes: Record<TabName, `/home` | `/feed` | `/scan` | `/maps` | `/account`> = {
  Home: "/home",
  Feed: "/feed",
  Scan: "/scan",
  Maps: "/maps",
  Account: "/account",
};

const icons: Record<TabName, FC<{ width?: number; height?: number }>> = {
  Home: HomeIcon,
  Feed: FeedIcon,
  Scan: ScanIcon,
  Maps: MapsIcon,
  Account: AccountIcon,
};

const BottomTabBar: FC<BottomTabBarProps> = ({ activeTab }) => {
  const router = useRouter();

  return (
    <View className="flex-row bg-white border-t border-gray-200 py-2 pb-5">
      {tabs.map((tab) => {
        const Icon = icons[tab];
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            className="flex-1 items-center py-2"
            onPress={() => router.push(routes[tab])}
            activeOpacity={0.8}
          >
            <Icon width={24} height={24} />
            <Text className={`text-xs font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomTabBar;
