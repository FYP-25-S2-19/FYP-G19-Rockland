import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackIcon from '../../assets/images/back.svg';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ question_id: number; selected_answer_id: number }[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setQuiz(data.quiz);
      } catch (err) {
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg font-bold text-red-500">Quiz not found</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];

  const handleNext = async () => {
    if (!selectedOptionId) {
      setShowError(true);
      return;
    }

    setShowError(false);

    const newAnswers = [
      ...answers,
      {
        question_id: currentQuestion.question_id,
        selected_answer_id: selectedOptionId,
      },
    ];

    setAnswers(newAnswers);
    setSelectedOptionId(null);

    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      await AsyncStorage.setItem('quizAnswers', JSON.stringify(newAnswers));

      router.replace({
        pathname: '/quizcomplete',
        params: {
          score: '0', // Real score will be calculated server-side
          total: quiz.questions.length.toString(),
          title: quiz.title,
          quizId: quiz.quiz_id.toString(),
        },
      });
    }
  };

  const handleQuitQuiz = async () => {
    await AsyncStorage.setItem('quizAnswers', JSON.stringify(answers));

    router.replace({
      pathname: '/quizcomplete',
      params: {
        score: '0',
        total: quiz.questions.length.toString(),
        title: quiz.title,
        quizId: quiz.quiz_id.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDF3E3]">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 mb-4 relative">
        <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute left-4 mt-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{quiz.title}</Text>
      </View>

      {/* Progress */}
      <Text className="text-center font-semibold text-l text-black mb-3">
        {String(currentQIndex + 1).padStart(2, '0')} of {quiz.questions.length}
      </Text>

      {/* Question Card */}
      <View className="bg-[#96DE9F] mx-4 p-4 rounded-xl shadow-lg">
        <Text className="text-center text-base font-bold mb-6 text-black">
          {currentQuestion.question_text}
        </Text>

        {currentQuestion.options.map((option: any) => {
          const isSelected = selectedOptionId === option.option_id;

          return (
            <TouchableOpacity
              key={option.option_id}
              onPress={() => setSelectedOptionId(option.option_id)}
              className={`flex-row justify-between items-center px-4 py-3 rounded-lg mb-3 ${
                isSelected ? 'bg-gray-700' : 'bg-gray-500'
              }`}
            >
              <Text className="text-white font-semibold">{option.option_text}</Text>
              <View
                className={`w-4 h-4 rounded-full border-2 ${
                  isSelected ? 'bg-green-500' : 'border-white'
                }`}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error Message */}
      {showError && (
        <Text className="text-red-500 text-center mt-4">Please select an answer!</Text>
      )}

      {/* Next Button */}
      <TouchableOpacity
        onPress={handleNext}
        className="mx-4 mt-4 py-3 rounded-xl bg-green-600"
      >
        <Text className="text-center text-white font-semibold text-base">Next</Text>
      </TouchableOpacity>

      {/* Exit Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-6">
          <View className="bg-white p-6 rounded-xl w-full max-w-md">
            <Text className="text-lg font-bold mb-4 text-center">Exit Quiz?</Text>
            <Text className="text-sm text-gray-700 text-center mb-6">
              Your unanswered questions will be marked as incorrect. You cannot continue later.
            </Text>
            <View className="flex-row justify-between">
              <Pressable
                className="bg-gray-300 py-3 px-6 rounded-xl mr-2 flex-1"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-center font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-black py-3 px-6 rounded-xl ml-2 flex-1"
                onPress={handleQuitQuiz}
              >
                <Text className="text-white text-center font-semibold">Exit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
