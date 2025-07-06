import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter, usePathname } from "expo-router";

// Icon imports for Expert
import HomeIcon from "../assets/icons/home.svg";
import HomeIconActive from "../assets/icons/home_active.svg";
import FeedIcon from "../assets/icons/feed.svg";
import FeedIconActive from "../assets/icons/feed_active.svg";
import QuizIcon from "../assets/icons/quiz.svg";
import QuizIconActive from "../assets/icons/quiz_active.svg";
import AccountIcon from "../assets/icons/account.svg";
import AccountIconActive from "../assets/icons/account_active.svg";
import DiscussionIcon from "../assets/icons/discussion.svg";
import DiscussionIconActive from "../assets/icons/discussion_active.svg";

const expertTabs = ["Home", "Feed", "Discussion", "Quiz", "Account"] as const;

const expertRoutes = {
  Home: "/(expert-tabs)/home",
  Feed: "/(expert-tabs)/feed",
  Discussion: "/(expert-tabs)/discussion",
  Quiz: "/(expert-tabs)/quizhome",
  Account: "/(expert-tabs)/account",
} as const;

type TabName = keyof typeof expertRoutes;

const expertIcons = {
  Home: { default: HomeIcon, active: HomeIconActive },
  Feed: { default: FeedIcon, active: FeedIconActive },
  Discussion: { default: DiscussionIcon, active: DiscussionIconActive },
  Quiz: { default: QuizIcon, active: QuizIconActive },
  Account: { default: AccountIcon, active: AccountIconActive },
};

export default function ExpertBottomTabBar() {
  const router = useRouter();
  const pathname = usePathname().toLowerCase();

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
      {expertTabs.map((tab) => {
        const routeFragment =
          expertRoutes[tab as TabName].split("/").pop()?.toLowerCase() || "";
        const isActive = pathname.includes(`/${routeFragment}`);
        const isCenter = tab === "Quiz";
        const Icon = isActive
          ? expertIcons[tab as TabName].active
          : expertIcons[tab as TabName].default;

        const scaleAnim = useRef(new Animated.Value(isActive ? 1.1 : 1)).current;
        const bumpAnim = useRef(
          new Animated.Value(isActive ? (isCenter ? -20 : -10) : 0)
        ).current;

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
            onPress={() => router.push(expertRoutes[tab as TabName])}
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
                isActive
                  ? "text-[#459B6C] font-bold"
                  : "text-gray-500 font-medium"
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
