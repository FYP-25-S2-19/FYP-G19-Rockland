import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/images/back.svg';
import HistoryIcon from '../assets/images/history.svg';
import { quizData } from '../data/quizData';

const getQuizImage = (id: string) => {
  switch (id) {
    case 'basic':
    case 'intermediate':
    case 'trivella':
      return require('../assets/images/rock_background.jpg');
    default:
      return require('../assets/images/rock_background.jpg');
  }
};

export default function QuizScreen() {
  const router = useRouter();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleStartQuiz = () => {
    if (selectedQuizId) {
      router.push(`/quiz/${selectedQuizId}`);
      setModalVisible(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 mb-8 relative">
        <TouchableOpacity onPress={() => router.replace('/home')} className="absolute left-4 mt-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Quizzes</Text>
        <TouchableOpacity onPress={() => router.push('/quizhistory')} className="absolute right-4 mt-4">
          <HistoryIcon width={24} height={24} />
        </TouchableOpacity>
      </View>

      {/* Quiz Cards */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
        {quizData.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            onPress={() => {
              setSelectedQuizId(quiz.id);
              setModalVisible(true);
            }}
            className="mb-4 rounded-[12px] overflow-hidden border border-black"
          >
            <ImageBackground
              source={getQuizImage(quiz.id)}
              resizeMode="cover"
              className="h-28 justify-center items-center"
            >
              {/* Overlay Layer */}
              <View className="absolute inset-0 bg-gray-800 opacity-70 rounded-[12px]" />

              {/* Text Content */}
              <Text className="text-lg font-bold text-white z-10">{quiz.title}</Text>
              <Text className="text-sm text-white z-10">
                {quiz.points} pts ({quiz.questions.length} Questions)
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-6">
          <View className="bg-white p-6 rounded-xl w-full max-w-md">
            <Text className="text-lg font-bold mb-4 text-center">Start Quiz?</Text>
            <Text className="text-sm text-gray-700 text-center mb-6">
              Once you start, you won’t be able to go back until you complete the quiz.
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
                onPress={handleStartQuiz}
              >
                <Text className="text-white text-center font-semibold">Start</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
