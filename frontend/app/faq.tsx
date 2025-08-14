import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // set in .env

export default function FaqScreen() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [askOpen, setAskOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [askLoading, setAskLoading] = useState(false);

  // Fetch FAQs from backend
  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/faqs/public`);
      if (response.data.success) {
        setFaqs(response.data.faqs);
      } else {
        setError("Failed to fetch FAQs");
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Something went wrong fetching FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const submitQuestion = async () => {
    const q = askText.trim();
    if (!q) {
      Alert.alert("Question required", "Please type your question.");
      return;
    }
    if (q.length > 500) {
      Alert.alert("Too long", "Please keep your question under 500 characters.");
      return;
    }

    try {
      setAskLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Login required", "Please log in to submit a question.");
        setAskLoading(false);
        return;
      }

      await axios.post(
        `${API_URL}/api/faqs/submit-question`,
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thanks!", "Your question has been submitted. Our team will review it.");
      setAskOpen(false);
      setAskText("");
    } catch (err: any) {
      console.error("Submit question error:", err?.response?.data || err);
      const msg =
        err?.response?.data?.message ||
        "Submission failed. Please try again in a moment.";
      Alert.alert("Oops", msg);
    } finally {
      setAskLoading(false);
    }
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
        <>
          <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 100 }}>
            {faqs.map((item, index) => (
              <View key={item.faq_id} className="border-b border-gray-300 py-3">
                <TouchableOpacity
                  onPress={() => toggleExpand(index)}
                  className="flex-row justify-between items-center"
                >
                  <Text className="text-base text-gray-800 font-medium flex-1 pr-4">
                    {item.question}
                  </Text>
                  <Text className="text-2xl text-gray-500 font-light">
                    {expandedIndex === index ? "−" : "+"}
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

          {/* Sticky bottom CTA */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: "white",
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb",
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700">Didn’t find an answer?</Text>
              <TouchableOpacity
                onPress={() => setAskOpen(true)}
                className="bg-[#16A34A] px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold text-sm">Submit your question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* Ask Question Modal */}
      <Modal
        visible={askOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAskOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setAskOpen(false)}
            className="flex-1 bg-black/40"
          />
          <View className="bg-white rounded-t-3xl px-5 pt-4 pb-6">
            <View className="h-1 w-10 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-semibold mb-4">Submit your question</Text>

            <Text className="text-xs text-gray-500 mb-1">Question *</Text>
            <TextInput
              value={askText}
              onChangeText={setAskText}
              placeholder="Type your question…"
              placeholderTextColor="#9CA3AF"
              multiline
              className="border border-gray-200 rounded-2xl px-3 py-3 min-h-[90px] text-gray-900"
              maxLength={500}
            />

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity onPress={() => setAskOpen(false)} className="px-4 py-3 mr-2">
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitQuestion}
                disabled={askLoading}
                className={`px-5 py-3 rounded-xl ${askLoading ? "bg-gray-400" : "bg-[#16A34A]"}`}
              >
                <Text className="text-white font-semibold">
                  {askLoading ? "Sending…" : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-[11px] text-gray-400 mt-3">
              Note: You need to be logged in to submit a question.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
