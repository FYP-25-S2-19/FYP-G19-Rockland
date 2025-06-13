import { View, Text, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FC } from "react";

type TabName = "Home" | "Feed" | "Scan" | "Maps" | "Account";

interface BottomTabBarProps {
  activeTab: TabName;
}

const routes = {
  Home: '/home',
  Feed: '/feed',
  Scan: '/scan',
  Maps: '/maps',
  Account: '/account',
} as const;

const icons: Record<TabName, any> = {
  Home: require("../assets/icons/home.png"),
  Feed: require("../assets/icons/feed.png"),
  Scan: require("../assets/icons/scan.png"),
  Maps: require("../assets/icons/map.png"),
  Account: require("../assets/icons/account.png"),
};

const tabs: TabName[] = ["Home", "Feed", "Scan", "Maps", "Account"];

const BottomTabBar: FC<BottomTabBarProps> = ({ activeTab }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row bg-white border-t border-gray-200 py-2"
      style={{ paddingBottom: insets.bottom }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          className="flex-1 items-center py-2"
          onPress={() => router.push(routes[tab])}
        >
          <Image source={icons[tab]} className="w-6 h-6 mb-1" resizeMode="contain" />
          <Text
            className={`text-xs font-medium ${
              activeTab === tab ? "text-green-600" : "text-gray-500"
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomTabBar;
