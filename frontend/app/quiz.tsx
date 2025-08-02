import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../assets/images/back.svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QuizListScreen() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<number | null>(null);
  const [interests, setInterests] = useState<{ interest_id: number; title: string }[]>([]);

  const fetchInterests = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/interests/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("💬 Raw interests from backend:", data.interests);
      if (data.success && Array.isArray(data.interests)) {
        const valid = data.interests.filter(i => i.interest_id && i.title);
        setInterests(valid);
      }
    } catch (err) {
      console.error('Error fetching interests:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (search.trim()) params.append('q', search.trim());
      if (typeof selectedInterest === 'number') {
        params.append('interest_id', selectedInterest.toString());
      }
      const res = await fetch(`${API_URL}/api/quizzes?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error('Failed to load quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
    fetchQuizzes();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [selectedInterest]);

  const handleStartQuiz = async (quizId: number) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/quizzes/${quizId}/check-eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.eligible) {
        Alert.alert("Not Eligible", data.message || "You are not eligible to take this quiz.");
        return;
      }
      router.push({ pathname: '/quiz/[id]', params: { id: quizId.toString() } });
    } catch (err) {
      console.error('Eligibility check failed:', err);
      Alert.alert('Error', 'Failed to check eligibility. Please try again later.');
    }
  };

  const handleBack = () => {
    router.push('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3E3]">
      {/* Header */}
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

      {/* Filters */}
      <View className="px-4 pt-4">
        <TextInput
          className="bg-white border border-gray-300 rounded-lg px-4 py-2 mb-3 text-black"
          placeholder="Search quizzes..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchQuizzes}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity
            key="interest-all"
            className={`px-4 py-2 mr-2 rounded-full ${selectedInterest === null ? 'bg-green-600' : 'bg-gray-300'}`}
            onPress={() => setSelectedInterest(null)}
          >
            <Text className="text-white font-semibold">All</Text>
          </TouchableOpacity>

          {interests.map((int) => (
            <TouchableOpacity
              key={`interest-${int.interest_id}`}
              className={`px-4 py-2 mr-2 rounded-full ${selectedInterest === int.interest_id ? 'bg-green-600' : 'bg-gray-300'}`}
              onPress={() => setSelectedInterest(int.interest_id)}
            >
              <Text className="text-white font-semibold">{int.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Quiz List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          {quizzes.map((quiz) => (
            <View key={`quiz-${quiz.quiz_id}`} className="bg-white rounded-xl shadow-md mb-4 p-4">
              <Text className="text-lg font-bold text-black mb-1">{quiz.title}</Text>
              {quiz.interest && (
                <Text className="text-xs text-green-700 mb-1">Interest: {quiz.interest}</Text>
              )}
              <Text className="text-sm text-gray-700 mb-4">{quiz.description}</Text>
              <TouchableOpacity
                className="bg-green-600 py-2 px-4 rounded-xl"
                onPress={() => handleStartQuiz(quiz.quiz_id)}
              >
                <Text className="text-white text-center font-semibold">Start Quiz</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
