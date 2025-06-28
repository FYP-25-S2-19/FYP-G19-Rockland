import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiIcon from '../assets/images/confetti.svg';

export default function QuizCompleteScreen() {
  const router = useRouter();
  const { score = '0', total = '0', title = 'Quiz' } = useLocalSearchParams();

  const correct = parseInt(score as string, 10);
  const totalQ = parseInt(total as string, 10);

  const percentage = totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0;
  const points = correct * 1; // ✅ Dummy logic: 1 point per correct answer

  const handleCollectReward = () => {
    // TODO: Save reward in DB or local storage
    alert('Point Collected!');
    router.replace('/quiz'); // Go back to quiz home
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      {/* Confetti Icon */}
      <ConfettiIcon width={64} height={64} className="mb-6" />

      {/* Title */}
      <Text className="text-2xl font-bold text-center mb-2">Quiz Completed</Text>

      {/* Score */}
      <Text className="text-lg font-semibold text-center mb-6">Score {percentage}%</Text>

      {/* Points earned */}
      <Text className="text-green-600 font-semibold mb-6">
        [{points} Point{points !== 1 ? 's' : ''} to Collect]
      </Text>

      {/* Collect Button */}
      <TouchableOpacity
        onPress={handleCollectReward}
        className="bg-gray-800 px-8 py-3 rounded-xl"
      >
        <Text className="text-white text-lg font-semibold">Collect Point</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
