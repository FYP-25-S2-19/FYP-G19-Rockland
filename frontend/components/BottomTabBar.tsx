import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FC } from "react";

// Import default and active icons
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

const icons: Record<
  TabName,
  {
    default: FC<{ width?: number; height?: number }>;
    active: FC<{ width?: number; height?: number }>;
  }
> = {
  Home: { default: HomeIcon, active: HomeIconActive },
  Feed: { default: FeedIcon, active: FeedIconActive },
  Scan: { default: ScanIcon, active: ScanIconActive },
  Maps: { default: MapsIcon, active: MapsIconActive },
  Account: { default: AccountIcon, active: AccountIconActive },
};

const BottomTabBar: FC<BottomTabBarProps> = ({ activeTab }) => {
  const router = useRouter();

  return (
    <View className="flex-row bg-white border-t border-gray-200 py-2 pb-5 justify-between px-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        const Icon = isActive ? icons[tab].active : icons[tab].default;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => router.push(routes[tab])}
            activeOpacity={0.8}
            className="items-center"
          >
            <View
              className={`w-14 h-14 rounded-[18px] items-center justify-center ${
                isActive ? "bg-[#459B6C]" : ""
              }`}
            >
              <Icon width={24} height={24} />
            </View>
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
};

export default BottomTabBar;
