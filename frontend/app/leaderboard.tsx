import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../assets/images/back.svg';
import CrownIcon from '../assets/images/crown1.svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const fallbackImage = require('../assets/images/profilepicture.png');

type LeaderboardEntry = {
  user_id: number;
  name: string;
  points: number;
  image?: any;
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leaderboard`);
        const json = await res.json();
        if (json.success) {
          setEntries(json.leaderboard || []);
        } else {
          console.error('Leaderboard fetch failed:', json.message);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getProfileImage = (img?: any) => img || fallbackImage;

  const topThree = entries.slice(0, 3);
  const others = entries.slice(3);

  const currentUserIndex = entries.findIndex((e) => e.name === 'You'); // customize if needed
  const currentUser = entries[currentUserIndex];

  return (
    <SafeAreaView className="flex-1 bg-green-200">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 mb-6 relative">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 ml-2 mt-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Leaderboard</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          {/* Podium */}
          <View className="flex-row justify-center items-end space-x-12 mb-12">
            {topThree.map((entry, i) => (
              <View
                key={entry.user_id}
                className={`items-center w-[100px] ${i === 1 ? "-mb-4" : i === 0 ? "-mt-6 z-10" : "-mb-4"}`}
              >
                {i === 0 && <CrownIcon width={36} height={36} style={{ marginBottom: -12 }} />}
                <View
                  className={`w-24 h-24 rounded-full overflow-hidden border-4 ${
                    i === 0
                      ? 'border-[#EF9E1C]'
                      : i === 1
                      ? 'border-gray-300'
                      : 'border-[#CD7F32]'
                  } mb-1`}
                >
                  <Image source={getProfileImage(entry.image)} className="w-full h-full" />
                </View>
                <Text className="text-3xl mb-1">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{
                    width: 80,
                    textAlign: 'center',
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: entry.name === 'You' ? '#db2777' : '#000',
                  }}
                >
                  {entry.name}
                </Text>
                <Text className="text-sm text-black">{entry.points} pts</Text>
              </View>
            ))}
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
              data={others}
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
                    <Text className="text-sm font-semibold w-6 text-gray-700">{index + 4}</Text>
                    <Image source={getProfileImage(item.image)} className="w-8 h-8 rounded-full mx-2" />
                    <Text
                      className={`text-sm w-[140px] truncate ${
                        item.name === 'You' ? 'text-pink-600 font-semibold' : 'text-gray-800'
                      }`}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm ${
                      item.name === 'You' ? 'font-bold text-pink-600' : 'font-normal text-gray-700'
                    }`}
                  >
                    {item.points} pts
                  </Text>
                </View>
              )}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
