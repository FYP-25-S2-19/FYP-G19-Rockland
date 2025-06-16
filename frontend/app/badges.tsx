"use client"


import BackIcon from "../assets/images/back.svg";
import { useRouter } from "expo-router";
import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"

// Badge type definitions
type BadgeStatus = "completed" | "in-progress"

type Badge = {
  id: string
  title: string
  description: string
  status: BadgeStatus
  progress?: {
    current: number
    total: number
  }
  reward: string
  completedDate?: string
  icon: string
  category: string
}

export default function BadgesProgressScreen() {
  const [activeTab, setActiveTab] = useState<"All" | "Earned" | "In Progress">("All")
  const router = useRouter();

  // Sample badge data
  const badges: Badge[] = [
    {
      id: "1",
      title: "First Scan",
      description: "Complete your first rock scan",
      status: "completed",
      reward: "+50 points",
      completedDate: "Jan 15, 2025",
      icon: "🪨",
      category: "Scanning Expert",
    },
    {
      id: "2",
      title: "Scan Master",
      description: "Complete 10 rock scans",
      status: "in-progress",
      progress: { current: 7, total: 10 },
      reward: "+100 points when completed",
      icon: "📷",
      category: "Scanning Expert",
    },
    {
      id: "3",
      title: "Social Butterfly",
      description: "Receive 25 likes on posts",
      status: "completed",
      reward: "+75 points",
      completedDate: "Feb 3, 2025",
      icon: "❤️",
      category: "Community",
    },
    {
      id: "4",
      title: "Conversationalist",
      description: "Comment on 20 posts",
      status: "in-progress",
      progress: { current: 12, total: 20 },
      reward: "+80 points when completed",
      icon: "💬",
      category: "Community",
    },
    {
      id: "5",
      title: "Quiz Champion",
      description: "Complete 5 geology quizzes",
      status: "completed",
      reward: "+120 points",
      completedDate: "Jan 28, 2025",
      icon: "🏆",
      category: "Learning",
    },
    {
      id: "6",
      title: "Rock Collector",
      description: "Identify 50 different rock types",
      status: "in-progress",
      progress: { current: 23, total: 50 },
      reward: "+200 points when completed",
      icon: "🪨",
      category: "Scanning Expert",
    },
  ]

  const handleBack = () => {
    router.back();
  };


  const handleTabPress = (tab: "All" | "Earned" | "In Progress") => {
    setActiveTab(tab)
  }

  // Filter badges based on active tab
  const filteredBadges = badges.filter((badge) => {
    if (activeTab === "Earned") return badge.status === "completed"
    if (activeTab === "In Progress") return badge.status === "in-progress"
    return true // All
  })

  // Group badges by category
  const groupedBadges = filteredBadges.reduce(
    (groups, badge) => {
      const category = badge.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(badge)
      return groups
    },
    {} as Record<string, Badge[]>,
  )

  // Calculate stats
  const earnedCount = badges.filter((b) => b.status === "completed").length
  const inProgressCount = badges.filter((b) => b.status === "in-progress").length
  const totalPoints = badges
    .filter((b) => b.status === "completed")
    .reduce((sum, badge) => {
      const points = Number.parseInt(badge.reward.match(/\d+/)?.[0] || "0")
      return sum + points
    }, 0)

  // Category icons
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Scanning Expert":
        return "📷"
      case "Community":
        return "👥"
      case "Learning":
        return "📚"
      default:
        return "🏅"
    }
  }

  // Render badge card
  const renderBadgeCard = (badge: Badge) => {
    const isCompleted = badge.status === "completed"
    const progressPercentage = badge.progress ? (badge.progress.current / badge.progress.total) * 100 : 0

    return (
      <View key={badge.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200 shadow-sm">
        {/* Badge header */}
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl">{badge.icon}</Text>
          {isCompleted ? (
            <View className="bg-gray-200 px-3 py-1 rounded-full">
              <Text className="text-gray-600 text-xs font-medium">Completed</Text>
            </View>
          ) : (
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 text-xs font-medium">
                {badge.progress?.current}/{badge.progress?.total}
              </Text>
            </View>
          )}
        </View>

        {/* Badge content */}
        <View className="space-y-2">
          <Text className="text-gray-900 font-semibold text-base">{badge.title}</Text>
          <Text className="text-gray-600 text-sm leading-5">{badge.description}</Text>

          {/* Progress bar for in-progress badges */}
          {!isCompleted && badge.progress && (
            <View className="my-2">
              <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <View className="bg-green-500 h-full rounded-full" style={{ width: `${progressPercentage}%` }} />
              </View>
            </View>
          )}

          {/* Reward info */}
          <Text className="text-green-600 text-xs font-medium">
            {badge.reward}
            {badge.completedDate && ` · ${badge.completedDate}`}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-gray-900 font-semibold text-lg">Badges & Progress</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View className="flex-row px-4 py-5 space-x-3">
          <View className="flex-1 bg-gray-100 rounded-xl p-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-2xl text-center">{earnedCount}</Text>
            <Text className="text-gray-600 text-sm text-center mt-1">Earned</Text>
          </View>
          <View className="flex-1 bg-gray-100 rounded-xl p-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-2xl text-center">{inProgressCount}</Text>
            <Text className="text-gray-600 text-sm text-center mt-1">In Progress</Text>
          </View>
          <View className="flex-1 bg-gray-100 rounded-xl p-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-2xl text-center">{totalPoints}</Text>
            <Text className="text-gray-600 text-sm text-center mt-1">Total Points</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-4 mb-5">
          {(["All", "Earned", "In Progress"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 border-b-2 ${activeTab === tab ? "border-green-500" : "border-transparent"}`}
              onPress={() => handleTabPress(tab)}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? "text-green-600 font-semibold" : "text-gray-600"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Badge Groups */}
        {Object.keys(groupedBadges).length > 0 ? (
          <View className="px-4">
            {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
              <View key={category} className="mb-6">
                {/* Category header */}
                <View className="flex-row items-center mb-4">
                  <Text className="text-xl mr-2">{getCategoryIcon(category)}</Text>
                  <Text className="text-gray-900 font-semibold text-lg">{category}</Text>
                </View>

                {/* Badge cards */}
                {categoryBadges.map(renderBadgeCard)}
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center py-16 px-8">
            <Text className="text-gray-600 text-center text-base leading-6">
              No badge progress yet. Start completing activities!
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  )
}
