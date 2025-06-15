"use client"

import { useState } from "react"
import { View, Text, Image, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"

// Trade offer type definitions
type TradeOffer = {
  id: string
  traderName: string
  traderRockCount: number
  traderJoinDate: string
  youGive: {
    rockName: string
    rockImage: string
  }
  youReceive: {
    rockName: string
    rockImage: string
  }
  isMyOffer: boolean
}

export default function TradeCollectionScreen() {
  const [activeTab, setActiveTab] = useState<"Available" | "MyOffers">("Available")

  // Sample trade data
  const tradeOffers: TradeOffer[] = [
    {
      id: "1",
      traderName: "Annie",
      traderRockCount: 47,
      traderJoinDate: "Jan 2024",
      youGive: {
        rockName: "Granite",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      youReceive: {
        rockName: "Obsidian",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      isMyOffer: false,
    },
    {
      id: "2",
      traderName: "Marie",
      traderRockCount: 23,
      traderJoinDate: "Dec 2023",
      youGive: {
        rockName: "Quartz",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      youReceive: {
        rockName: "Amethyst",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      isMyOffer: false,
    },
    {
      id: "3",
      traderName: "You",
      traderRockCount: 0,
      traderJoinDate: "",
      youGive: {
        rockName: "Basalt",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      youReceive: {
        rockName: "Limestone",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      isMyOffer: true,
    },
    {
      id: "4",
      traderName: "You",
      traderRockCount: 0,
      traderJoinDate: "",
      youGive: {
        rockName: "Sandstone",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      youReceive: {
        rockName: "Marble",
        rockImage: "/placeholder.svg?height=80&width=80",
      },
      isMyOffer: true,
    },
  ]

  const handleBack = () => {
    console.log("Back pressed")
  }

  const handleTabPress = (tab: "Available" | "MyOffers") => {
    setActiveTab(tab)
  }

  const handleAcceptTrade = (tradeId: string) => {
    console.log("Accept trade:", tradeId)
  }

  const handleCreateTradeOffer = () => {
    console.log("Create trade offer pressed")
  }

  // Filter trades based on active tab
  const filteredTrades = tradeOffers.filter((trade) => {
    if (activeTab === "Available") return !trade.isMyOffer
    return trade.isMyOffer
  })

  // Get tab counts
  const availableCount = tradeOffers.filter((t) => !t.isMyOffer).length
  const myOffersCount = tradeOffers.filter((t) => t.isMyOffer).length

  // Render trade card
  const renderTradeCard = (trade: TradeOffer) => {
    return (
      <View key={trade.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
        {/* Trader info */}
        {!trade.isMyOffer && (
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
                <Text className="text-gray-600 font-semibold">{trade.traderName[0]}</Text>
              </View>
              <View>
                <Text className="text-gray-900 font-semibold text-base">{trade.traderName}</Text>
                <Text className="text-gray-500 text-sm">
                  {trade.traderRockCount} rocks • Joined {trade.traderJoinDate}
                </Text>
              </View>
            </View>
            <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-lg" onPress={() => handleAcceptTrade(trade.id)}>
              <Text className="text-white font-semibold text-sm">Accept Trade</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trade details */}
        <View className="flex-row items-center justify-between">
          {/* You Give */}
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-sm mb-2">You Give</Text>
            <View className="bg-gray-50 rounded-lg p-3 items-center w-full">
              <Image source={{ uri: trade.youGive.rockImage }} className="w-16 h-16 rounded-lg mb-2" />
              <Text className="text-gray-900 font-medium text-sm text-center">{trade.youGive.rockName}</Text>
            </View>
          </View>

          {/* Arrow */}
          <View className="mx-4">
            <Text className="text-gray-400 text-2xl">→</Text>
          </View>

          {/* You Receive */}
          <View className="flex-1 items-center">
            <Text className="text-gray-500 text-sm mb-2">You Receive</Text>
            <View className="bg-gray-50 rounded-lg p-3 items-center w-full">
              <Image source={{ uri: trade.youReceive.rockImage }} className="w-16 h-16 rounded-lg mb-2" />
              <Text className="text-gray-900 font-medium text-sm text-center">{trade.youReceive.rockName}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* App Bar */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Text className="text-gray-900 text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 font-semibold text-lg">Trade Collection</Text>
          <View className="w-6" />
        </View>

        {/* Tabs */}
        <View className="flex-row px-4">
          <TouchableOpacity
            className={`flex-1 py-3 border-b-2 ${
              activeTab === "Available" ? "border-green-500" : "border-transparent"
            }`}
            onPress={() => handleTabPress("Available")}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === "Available" ? "text-green-600 font-semibold" : "text-gray-600"
              }`}
            >
              Available Trades ({availableCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 border-b-2 ${activeTab === "MyOffers" ? "border-green-500" : "border-transparent"}`}
            onPress={() => handleTabPress("MyOffers")}
          >
            <Text
              className={`text-center font-medium ${
                activeTab === "MyOffers" ? "text-green-600 font-semibold" : "text-gray-600"
              }`}
            >
              My Trade Offers ({myOffersCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {filteredTrades.length > 0 ? (
          <>
            {filteredTrades.map(renderTradeCard)}

            {/* Create Trade Offer Button - only show on My Offers tab */}
            {activeTab === "MyOffers" && (
              <TouchableOpacity
                className="bg-green-500 rounded-xl py-4 items-center mt-4"
                onPress={handleCreateTradeOffer}
              >
                <Text className="text-white font-semibold text-lg">Create Trade Offer</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View className="items-center py-16">
            <Text className="text-gray-500 text-center text-base">
              {activeTab === "Available"
                ? "No available trades at the moment"
                : "You haven't created any trade offers yet"}
            </Text>
            {activeTab === "MyOffers" && (
              <TouchableOpacity className="bg-green-500 rounded-xl px-6 py-3 mt-4" onPress={handleCreateTradeOffer}>
                <Text className="text-white font-semibold">Create Your First Trade</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  )
}
