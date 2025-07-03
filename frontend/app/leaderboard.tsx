import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/images/back.svg';
import CrownIcon from '../assets/images/crown1.svg';

type Timeframe = 'Today' | 'This Week' | 'All Time';

type LeaderboardEntry = {
  name: string;
  score: number;
  image?: any;
};

const fallbackImage = require('../assets/images/profilepicture.png');

const dummyData: Record<Timeframe, LeaderboardEntry[]> = {
  Today: [
    { name: 'Bryan Wolf', score: 43, image: fallbackImage },
    { name: 'Meghan Jessica', score: 40, image: fallbackImage },
    { name: 'Alex Turner', score: 38, image: fallbackImage },
    { name: 'Marsha Fisher', score: 36 },
    { name: 'Juanita Cormier', score: 35 },
    { name: 'Tamara Schmidt', score: 33 },
    { name: 'Ricardo Veum', score: 32 },
    { name: 'Gary Sanford', score: 31 },
    { name: 'Becky Bartell', score: 30 },
    { name: 'John Smith', score: 29 },
    { name: 'Jane Doe', score: 28 },
    { name: 'You', score: 27 },
    { name: 'Tom Hanks', score: 26 },
    { name: 'Emily Clark', score: 25 },
    { name: 'Michael Scott', score: 24 },
  ],
  'This Week': [
    { name: 'Bryan Wolf', score: 120, image: fallbackImage },
    { name: 'Alex Turner', score: 115, image: fallbackImage },
    { name: 'You', score: 110, image: fallbackImage },
    { name: 'Marsha Fisher', score: 105 },
    { name: 'Meghan Jessica', score: 101 },
    { name: 'Gary Sanford', score: 99 },
    { name: 'Becky Bartell', score: 94 },
    { name: 'Juanita Cormier', score: 92 },
    { name: 'Tamara Schmidt', score: 90 },
    { name: 'Ricardo Veum', score: 88 },
  ],
  'All Time': [
    { name: 'You', score: 999 },
    { name: 'Bryan Wolf', score: 920 },
    { name: 'Meghan Jessica', score: 910 },
    { name: 'Alex Turner', score: 890 },
    { name: 'Gary Sanford', score: 875 },
    { name: 'Juanita Cormier', score: 860 },
    { name: 'Becky Bartell', score: 845 },
    { name: 'Ricardo Veum', score: 830 },
    { name: 'Tamara Schmidt', score: 820 },
    { name: 'Marsha Fisher', score: 800 },
  ],
};

const timeframes: Timeframe[] = ['Today', 'This Week', 'All Time'];

export default function LeaderboardScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Timeframe>('Today');
  const data = dummyData[selected];
  const topThree = data.slice(0, 3);
  const topTen = data.slice(3, 10);
  const currentUserIndex = data.findIndex((u) => u.name === 'You');
  const currentUser = data[currentUserIndex];

  const handleGoBack = () => router.back();

  const getProfileImage = (img?: any) => img || fallbackImage;

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 mb-6 relative">
        <TouchableOpacity onPress={handleGoBack} className="absolute left-4 ml-2 mt-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Leaderboard</Text>
      </View>

      {/* Timeframe Selector */}
      <View className="flex-row justify-center mb-8">
        {timeframes.map((time) => (
          <TouchableOpacity
            key={time}
            onPress={() => setSelected(time)}
            className={`w-[90px] py-2 rounded-[12px] mx-2 ${
              selected === time ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <Text
              className={`text-sm font-medium text-center ${
                selected === time ? 'text-white' : 'text-black'
              }`}
            >
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium */}
      <View className="flex-row justify-center items-end space-x-12 mb-12">
        {/* 🥈 Second Place */}
        <View className="items-center w-[100px] -mb-4">
          <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 mb-1">
            <Image source={getProfileImage(topThree[1].image)} className="w-full h-full" />
          </View>
          <Text className="text-3xl mb-1">🥈</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              width: 80,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 'bold',
              color: topThree[1].name === 'You' ? '#db2777' : '#000',
            }}
          >
            {topThree[1].name}
          </Text>
          <Text className="text-sm text-black">{topThree[1].score} pts</Text>
        </View>

        {/* 🥇 First Place */}
        <View className="items-center w-[110px] -mt-6 z-10">
          <CrownIcon width={36} height={36} style={{ marginBottom: -12 }} />
          <View className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#EF9E1C] mb-1">
            <Image source={getProfileImage(topThree[0].image)} className="w-full h-full" />
          </View>
          <Text className="text-3xl mb-1">🥇</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              width: 80,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 'bold',
              color: topThree[0].name === 'You' ? '#db2777' : '#000',
            }}
          >
            {topThree[0].name}
          </Text>
          <Text className="text-sm text-black">{topThree[0].score} pts</Text>
        </View>

        {/* 🥉 Third Place */}
        <View className="items-center w-[100px] -mb-4">
          <View className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#CD7F32] mb-1">
            <Image source={getProfileImage(topThree[2].image)} className="w-full h-full" />
          </View>
          <Text className="text-3xl mb-1">🥉</Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              width: 80,
              textAlign: 'center',
              fontSize: 14,
              fontWeight: 'bold',
              color: topThree[2].name === 'You' ? '#db2777' : '#000',
            }}
          >
            {topThree[2].name}
          </Text>
          <Text className="text-sm text-black">{topThree[2].score} pts</Text>
        </View>
      </View>

      {/* Remaining Users */}
      <View
        style={{
          backgroundColor: '#459B6C',
          flex: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <FlatList
          data={topTen}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: currentUserIndex > 9 ? 100 : 16,
          }}
          renderItem={({ item, index }) => (
            <View
              className={`flex-row justify-between items-center px-4 py-4 mb-2 mx-2 ${
                item.name === 'You' ? 'bg-pink-200' : 'bg-white'
              } rounded-[12px]`}
            >
              <View className="flex-row items-center">
                <Text className="text-sm font-semibold w-6 text-gray-700">
                  {index + 4}
                </Text>
                <Image
                  source={getProfileImage(item.image)}
                  className="w-8 h-8 rounded-full mx-2"
                />
                <Text
                  className={`text-sm w-[140px] truncate ${
                    item.name === 'You'
                      ? 'text-pink-600 font-semibold'
                      : 'text-gray-800'
                  }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.name}
                </Text>
              </View>
              <Text
                className={`text-sm ${
                  item.name === 'You'
                    ? 'font-bold text-pink-600'
                    : 'font-normal text-gray-700'
                }`}
              >
                {item.score} pts
              </Text>
            </View>
          )}
        />
      </View>

      {/* Sticky Current User Bar */}
      {currentUserIndex > 9 && (
        <View
          className="absolute bottom-0 left-0 right-0 px-6 py-3"
          style={{ backgroundColor: '#459B6C' }}
        >
          <View className="flex-row justify-between items-center px-4 py-4 rounded-[12px] bg-pink-200">
            <View className="flex-row items-center">
              <Text className="text-sm font-semibold w-6 text-gray-700">
                {currentUserIndex + 1}
              </Text>
              <Image
                source={getProfileImage(currentUser.image)}
                className="w-8 h-8 rounded-full mx-2"
              />
              <Text
                className="text-sm font-semibold text-pink-600 w-[140px] truncate"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                You
              </Text>
            </View>
            <Text className="text-sm font-bold text-pink-600">
              {currentUser.score} pts
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
