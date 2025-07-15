import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../assets/images/back.svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QuizListScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/quizzes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quizId: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/quizzes/${quizId}/check-eligibility`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.eligible) {
        Alert.alert("Not Eligible", data.message || "You are not eligible to take this quiz.");
        return;
      }

      router.push({
        pathname: '/quiz/[id]',
        params: { id: quizId.toString() },
      });
    } catch (err) {
      console.error('Eligibility check failed:', err);
      Alert.alert('Error', 'Failed to check eligibility. Please try again later.');
    }
  };

  const handleBack = () => {
    router.push('/(tabs)/home');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3E3]">
      {/* Header with Back Button */}
      <View className="border-b border-gray-100 px-4 py-4 bg-white">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
            <BackIcon width={24} height={24} />
          </TouchableOpacity>

          <Text className="text-xl font-semibold text-gray-800">Quizzes</Text>

          <TouchableOpacity onPress={() => router.push('/quizhistory')}>
            <Text className="text-sm font-semibold text-gray-700">📜 History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quizzes List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {quizzes.map((quiz) => (
          <View key={quiz.id || quiz.quiz_id} className="bg-white rounded-xl shadow-md mb-4 p-4">
            <Text className="text-lg font-bold text-black mb-2">{quiz.title}</Text>
            <Text className="text-sm text-gray-700 mb-4">{quiz.description}</Text>
            <TouchableOpacity
              className="bg-green-600 py-2 px-4 rounded-xl"
              onPress={() => handleStartQuiz(quiz.id || quiz.quiz_id)}
            >
              <Text className="text-white text-center font-semibold">Start Quiz</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
