"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image } from "react-native"

// Rock type definitions
type Rock = {
  id: string
  name: string
  type: string
  image: string
  rarity?: string
}

type TradeOffer = {
  rockToReceive: Rock & { owner: string }
  categoryToGive: string
  availableRocks: Rock[]
}

export default function TradeSelectionScreen() {
  const [selectedRockId, setSelectedRockId] = useState<string | null>(null)

  // Sample trade data
  const tradeOffer: TradeOffer = {
    rockToReceive: {
      id: "receive-1",
      name: "Amethyst Crystal",
      type: "Mineral",
      image: "/placeholder.svg?height=80&width=80",
      owner: "@Marie",
    },
    categoryToGive: "Rose Quartz",
    availableRocks: [
      {
        id: "1",
        name: "Rose Quartz Cluster",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Common",
      },
      {
        id: "2",
        name: "Rose Quartz Tumbled",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Common",
      },
      {
        id: "3",
        name: "Rose Quartz Raw",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Rare",
      },
      {
        id: "4",
        name: "Rose Quartz Sphere",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Rare",
      },
      {
        id: "5",
        name: "Rose Quartz Point",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Common",
      },
      {
        id: "6",
        name: "Rose Quartz Pendant",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Uncommon",
      },
      {
        id: "7",
        name: "Rose Quartz Bracelet",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Uncommon",
      },
      {
        id: "8",
        name: "Rose Quartz Geode",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Legendary",
      },
      {
        id: "9",
        name: "Rose Quartz Tower",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Rare",
      },
      {
        id: "10",
        name: "Rose Quartz Heart",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Common",
      },
      {
        id: "11",
        name: "Rose Quartz Wand",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Uncommon",
      },
      {
        id: "12",
        name: "Rose Quartz Pyramid",
        type: "Mineral",
        image: "/placeholder.svg?height=80&width=80",
        rarity: "Rare",
      },
    ],
  }

  const handleBack = () => {
    console.log("Back pressed")
  }

  const handleRockSelect = (rockId: string) => {
    setSelectedRockId(rockId)
    console.log("Selected rock:", rockId)
  }

  const handleConfirmTrade = () => {
    if (selectedRockId) {
      const selectedRock = tradeOffer.availableRocks.find((rock) => rock.id === selectedRockId)
      console.log("Confirm trade:", selectedRock?.name, "for", tradeOffer.rockToReceive.name)
    }
  }

  const selectedRock = tradeOffer.availableRocks.find((rock) => rock.id === selectedRockId)

  // Render rock card
  const renderRockCard = ({ item }: { item: Rock }) => {
    const isSelected = item.id === selectedRockId

    // Get rarity color
    const getRarityColor = (rarity: string) => {
      switch (rarity) {
        case "Legendary":
          return "bg-yellow-100 text-yellow-800"
        case "Rare":
          return "bg-purple-100 text-purple-800"
        case "Uncommon":
          return "bg-blue-100 text-blue-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }

    return (
      <TouchableOpacity
        className={`bg-white rounded-lg p-4 mb-3 border-2 ${
          isSelected ? "border-green-500" : "border-gray-200"
        } shadow-sm`}
        onPress={() => handleRockSelect(item.id)}
      >
        <View className="flex-row items-center">
          {/* Rock image */}
          <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-4" />

          {/* Rock info */}
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">{item.name}</Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 px-2 py-1 rounded-full mr-2">
                <Text className="text-gray-600 text-xs font-medium">{item.type}</Text>
              </View>
              {item.rarity && (
                <View className={`px-2 py-1 rounded-full ${getRarityColor(item.rarity)}`}>
                  <Text className="text-xs font-medium">{item.rarity}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Check icon */}
          {isSelected && <Text className="text-green-500 text-xl ml-2">✅</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Top Navigation */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <Text className="text-gray-900 text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 font-semibold text-lg">Trade Selection</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Trade Summary */}
        <View className="px-4 py-6">
          <Text className="text-gray-700 font-medium text-base mb-3">You want to receive:</Text>
          <View className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <View className="flex-row items-center">
              <Image source={{ uri: tradeOffer.rockToReceive.image }} className="w-16 h-16 rounded-lg mr-4" />
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-base mb-1">{tradeOffer.rockToReceive.name}</Text>
                <Text className="text-gray-600 text-sm mb-1">Type: {tradeOffer.rockToReceive.type}</Text>
                <Text className="text-gray-500 text-sm">Owner: {tradeOffer.rockToReceive.owner}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Selection List */}
        <View className="px-4 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-700 font-medium text-base">Select a {tradeOffer.categoryToGive}</Text>
            <Text className="text-gray-500 text-sm">{tradeOffer.availableRocks.length} rocks</Text>
          </View>

          <FlatList
            data={tradeOffer.availableRocks}
            renderItem={renderRockCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View className="bg-white border-t border-gray-200 px-4 py-4">
        <TouchableOpacity
          className={`rounded-lg py-4 items-center mb-2 ${selectedRockId ? "bg-green-500" : "bg-gray-300"}`}
          onPress={handleConfirmTrade}
          disabled={!selectedRockId}
        >
          <Text className={`font-semibold text-lg ${selectedRockId ? "text-white" : "text-gray-500"}`}>
            Confirm Trade
          </Text>
        </TouchableOpacity>

        {selectedRock && (
          <Text className="text-gray-600 text-sm text-center">
            Trading {selectedRock.name} for {tradeOffer.rockToReceive.name}
          </Text>
        )}
      </View>
    </SafeAreaView>
  )
}
