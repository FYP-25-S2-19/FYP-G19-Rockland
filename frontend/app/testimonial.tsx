// app/testimonials.tsx (or wherever you route it)
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BackIcon from "../assets/images/back.svg";
import Ionicons from "@expo/vector-icons/Ionicons";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // set via .env / eas

export default function TestimonialsScreen() {
  const router = useRouter();

  const [rating, setRating] = useState<number>(0);
  const [testimony, setTestimony] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const MAX_LEN = 800;

  const onSubmit = async () => {
    const t = testimony.trim();

    if (!rating) return Alert.alert("Rating required", "Please select a star rating (1–5).");
    if (!t) return Alert.alert("Feedback required", "Please write your feedback.");
    if (t.length > MAX_LEN) return Alert.alert("Too long", `Please keep feedback under ${MAX_LEN} characters.`);

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Login required", "Please log in to submit a testimonial.");
        setSubmitting(false);
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/testimonials/create`,
        { rating, testimony: t },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        Alert.alert("Thank you!", "Your testimonial has been submitted.", [
          { text: "OK", onPress: () => router.back() },
        ]);

        setRating(0);
        setTestimony("");
      } else {
        const msg = res.data?.message || "Failed to submit. Please try again.";
        Alert.alert("Oops", msg);
      }
    } catch (err: any) {
      console.error("Submit testimonial error:", err?.response?.data || err);
      const msg = err?.response?.data?.message || "Submission failed. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const Star = ({ index }: { index: number }) => {
    const filled = index <= rating;
    return (
      <TouchableOpacity
        onPress={() => setRating(index)}
        activeOpacity={0.8}
        className="mr-1"
        accessibilityRole="button"
        accessibilityLabel={`Rate ${index} star${index > 1 ? "s" : ""}`}
      >
        <Ionicons name={filled ? "star" : "star-outline"} size={28} color={filled ? "#FBBF24" : "#9CA3AF"} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-5 pt-5 pb-3 border-b border-gray-200 relative">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Share Your Experience</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="px-5"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >

          <Text className="text-gray-900 text-base font-semibold mt-10">Rating *</Text>
          <View className="flex-row items-center mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} index={i} />
            ))}
            <Text className="ml-2 text-gray-600">{rating ? `${rating}/5` : "Tap to rate"}</Text>
          </View>

          <Text className="text-gray-900 text-base font-semibold mt-5">Feedback *</Text>
          <TextInput
            value={testimony}
            onChangeText={setTestimony}
            placeholder="Tell us what you liked or what we should improve…"
            placeholderTextColor="#9CA3AF"
            className="mt-2 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 min-h-[120px]"
            multiline
            textAlignVertical="top"
            maxLength={MAX_LEN}
          />
          <View className="flex-row justify-end mt-1">
            <Text className="text-xs text-gray-500">{testimony.length}/{MAX_LEN}</Text>
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            disabled={submitting}
            className={`mt-6 rounded-2xl px-5 py-4 items-center ${submitting ? "bg-gray-400" : "bg-[#16A34A]"}`}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold">Submit Testimonial</Text>
            )}
          </TouchableOpacity>

          <Text className="text-[11px] text-gray-400 mt-3">
            By submitting, you consent to us storing and potentially displaying your testimonial (name & rating).
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
