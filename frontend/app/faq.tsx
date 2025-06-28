import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import BackIcon from '../assets/images/back.svg';
import { useRouter } from 'expo-router';

const faqData = [
  {
    question: 'How do I scan a rock?',
    answer: 'Open the Scan tab and point your camera at the rock.',
  },
  {
    question: 'How do I save a rock scan?',
    answer: 'Go to your scan result and tap the save icon.',
  },
  {
    question: 'How do I upgrade my account?',
    answer: 'Navigate to Settings > Upgrade and follow the instructions.',
  },
  {
    question: 'How do I earn points?',
    answer: 'You earn points by completing quizzes, scanning rocks, and contributing content.',
  },
  {
    question: 'How many free scans do I get?',
    answer: 'Free users get 3 scans per day.',
  },
  {
    question: 'What if no rock information is found?',
    answer: 'Try scanning again from a different angle or check your internet connection.',
  },
];

export default function FaqScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 pb-3 border-b border-gray-200 relative">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <BackIcon width={22} height={22} />
        </TouchableOpacity>
        <Text className="text-lg font-bold">FAQ</Text>
      </View>

      {/* Content */}
      <ScrollView className="px-4">
        {faqData.map((item, index) => (
          <View
            key={index}
            className="border-b border-gray-300 py-3"
          >
            <TouchableOpacity
              onPress={() => toggleExpand(index)}
              className="flex-row justify-between items-center"
            >
              <Text className="text-base text-gray-800 font-medium">
                {item.question}
              </Text>
              <Text className="text-2xl text-gray-500 font-light">
                {expandedIndex === index ? '−' : '+'}
              </Text>
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text className="mt-2 text-gray-700 text-sm leading-relaxed">
                A: {item.answer}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
