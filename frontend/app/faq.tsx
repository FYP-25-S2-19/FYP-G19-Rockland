import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import BackIcon from '../assets/images/back.svg';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL; // Make sure this is set in .env

export default function FaqScreen() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch FAQs from backend
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/faqs/public`);
      if (response.data.success) {
        setFaqs(response.data.faqs);
      } else {
        setError('Failed to fetch FAQs');
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Something went wrong fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-5 pb-3 border-b border-gray-300 relative">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">FAQ</Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500">{error}</Text>
        </View>
      ) : (
        <ScrollView className="px-4">
          {faqs.map((item, index) => (
            <View
              key={item.faq_id}
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
      )}
    </SafeAreaView>
  );
}
