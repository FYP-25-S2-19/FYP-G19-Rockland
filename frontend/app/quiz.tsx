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

      // ✅ Eligible - go to quiz screen
      router.push({
        pathname: '/quiz/[id]',
        params: { id: quizId.toString() },
      });
    } catch (err) {
      console.error('Eligibility check failed:', err);
      Alert.alert('Error', 'Failed to check eligibility. Please try again later.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3E3] px-4 pt-4">
      <ScrollView>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold">Available Quizzes</Text>
          <TouchableOpacity
            onPress={() => router.push('/quizhistory')}
            className="bg-gray-800 px-3 py-1 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">📜 View History</Text>
          </TouchableOpacity>
        </View>

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
      </ScrollView>
    </SafeAreaView>
  );
}
