import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/images/back1.svg';
import CalendarIcon from '../assets/images/calendar.svg';

const dummyHistory = [
  {
    title: 'Rock Basic Quiz',
    score: 8,
    total: 10,
    points: 8,
    date: '2025-06-05',
  },
  {
    title: 'Rock Basic Quiz',
    score: 9,
    total: 10,
    points: 9,
    date: '2025-05-07',
  },
];

type SortType =
  | 'earliest'
  | 'latest'
  | 'highestScore'
  | 'lowestScore'
  | 'highestPoint'
  | 'lowestPoint';

const sortLabels: Record<SortType, string> = {
  earliest: 'Earliest First',
  latest: 'Latest First',
  highestScore: 'Highest Score',
  lowestScore: 'Lowest Score',
  highestPoint: 'Highest Point',
  lowestPoint: 'Lowest Point',
};

export default function QuizHistoryScreen() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortType>('earliest');
  const [showDropdown, setShowDropdown] = useState(false);

  const sortedHistory = [...dummyHistory].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'earliest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highestScore':
        return b.score / b.total - a.score / a.total;
      case 'lowestScore':
        return a.score / a.total - b.score / b.total;
      case 'highestPoint':
        return b.points - a.points;
      case 'lowestPoint':
        return a.points - b.points;
      default:
        return 0;
    }
  });

  const totalQuiz = dummyHistory.length;
  const totalScore = dummyHistory.reduce((sum, q) => sum + q.score / q.total, 0);
  const avgScore = totalQuiz > 0 ? Math.round((totalScore / totalQuiz) * 100) : 0;
  const highestScore = Math.max(...dummyHistory.map((q) => Math.round((q.score / q.total) * 100)));
  const totalPoints = dummyHistory.reduce((sum, q) => sum + q.points, 0);

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3E3]">
      {/* Header and Stats */}
      <View style={{
        backgroundColor: '#459B6C',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        }} className="pb-2">
        <View className="flex-row items-center justify-center px-4 pt-4 relative mb-4">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-4 mt-2">
            <BackIcon width={24} height={24}/>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#F8EFDD]">Quiz History</Text>
        </View>

        {/* Stats Header */}
       <View style={{ backgroundColor: '#459B6C'}} className="px-4 py-5 rounded-b-2xl mb-1">
        {/* First Row: Labels */}
        <View className="flex-row justify-between mb-1">
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-lg font-semibold text-center leading-tight">Total Quiz</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-lg font-semibold text-center leading-tight">Average Score</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-lg font-semibold text-center leading-tight">Highest Score</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-lg font-semibold text-center leading-tight">Total Point</Text>
            </View>
        </View>

        {/* Second Row: Values */}
        <View className="flex-row justify-between mt-1">
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-4xl font-bold text-center">{totalQuiz}</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-4xl font-bold text-center">{avgScore}%</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-4xl font-bold text-center">{highestScore}%</Text>
            </View>
            <View className="flex-1 items-center">
            <Text className="text-[#F8EFDD] text-4xl font-bold text-center">{totalPoints}</Text>
            </View>
        </View>
        </View>
      </View>
      

      {/* Sort By */}
      <View className="px-4 my-4">
        <Text className="mb-2 font-semibold text-black">Sort By</Text>
        <TouchableOpacity
          onPress={() => setShowDropdown(!showDropdown)}
          className="flex-row justify-between items-center bg-white px-4 py-3 rounded-lg"
          style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
        >
          <Text className="text-base text-gray-900">{sortLabels[sortBy]}</Text>
          <Text className="text-sm text-gray-500">▼</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View className="mt-2 border border-gray-200 rounded-lg bg-white">
            {Object.entries(sortLabels).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setSortBy(key as SortType);
                  setShowDropdown(false);
                }}
                className={`px-4 py-3 ${sortBy === key ? 'bg-gray-100' : ''}`}
              >
                <Text className="text-gray-800">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Quiz History Cards */}
      <ScrollView className="px-4 pb-6">
        {sortedHistory.map((quiz, index) => (
          <View
            key={index}
            className="bg-white p-4 rounded-xl shadow-sm mb-4 flex-row justify-between items-start"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <View className="flex-1 mr-4">
              <Text className="font-bold text-black text-base mb-1">{quiz.title}</Text>
              <Text className="text-sm text-black mb-1">
                Score {quiz.score}/{quiz.total} ({Math.round((quiz.score / quiz.total) * 100)}%)
              </Text>
              <View className="flex-row items-center space-x-1">
                <CalendarIcon width={14} height={14} />
                <Text className="text-sm text-gray-700">
                  {new Date(quiz.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <Text className="text-green-600 font-bold text-sm">{quiz.points} Points</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
