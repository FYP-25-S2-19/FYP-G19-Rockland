import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackIcon from '../../assets/images/back.svg';
import { quizData } from '../../data/quizData';

export default function QuizDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const quiz = quizData.find((q) => q.id === id);

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showError, setShowError] = useState(false);

  if (!quiz) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg font-bold text-red-500">Quiz not found</Text>
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];

  const handleNext = () => {
    if (!selectedOption) {
      setShowError(true);
      return;
    }

    setShowError(false);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newAnswers = [...answered, isCorrect];
    setAnswered(newAnswers);
    setSelectedOption(null);

    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      const correctCount = newAnswers.filter(Boolean).length;
      router.replace({
        pathname: '/quizcomplete',
        params: {
          score: correctCount.toString(),
          total: quiz.questions.length.toString(),
          title: quiz.title,
        },
      });
    }
  };

  const handleQuitQuiz = () => {
    const remaining = quiz.questions.length - answered.length;
    const autoMarkedWrong = Array(remaining).fill(false);
    const correctCount = [...answered, ...autoMarkedWrong].filter((a) => a).length;

    router.replace({
      pathname: '/quizcomplete',
      params: {
        score: correctCount.toString(),
        total: quiz.questions.length.toString(),
        title: quiz.title,
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
          {currentQuestion.question}
        </Text>

        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedOption(option)}
              className={`flex-row justify-between items-center px-4 py-3 rounded-lg mb-3 ${
                isSelected ? 'bg-gray-700' : 'bg-gray-500'
              }`}
            >
              <Text className="text-white font-semibold">{option}</Text>
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
