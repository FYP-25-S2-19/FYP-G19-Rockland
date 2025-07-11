import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfettiIcon from "../assets/images/confetti.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function QuizCompleteScreen() {
  const router = useRouter();
  const { title = "Quiz", quizId = "0" } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  useEffect(() => {
    const submitAnswers = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const storedAnswers = await AsyncStorage.getItem("quizAnswers");
        const parsed = JSON.parse(storedAnswers || "[]");

        // Convert boolean answers to option_id payloads
        const formattedAnswers = parsed.map((ans: any) => ({
          selected_answer_id: ans.selected_answer_id ?? -1,
        }));

        const res = await fetch(`${API_URL}/api/quizzes/${quizId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers: formattedAnswers }),
        });

        if (!res.ok) throw new Error("Submission failed");

        const result = await res.json();
        setScore(result.score);
        setPoints(result.points_earned);
        setTotal(formattedAnswers.length);

        await AsyncStorage.removeItem("quizAnswers");
      } catch (err) {
        console.error("Error submitting quiz:", err);
        Alert.alert("Error", "Failed to submit your answers.");
      } finally {
        setLoading(false);
      }
    };

    submitAnswers();
  }, [quizId]);

  const handleReturn = () => {
    router.replace("/quiz");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <ConfettiIcon width={64} height={64} className="mb-6" />
      <Text className="text-2xl font-bold text-center mb-2">
        Quiz Completed
      </Text>
      <Text className="text-lg font-semibold text-center mb-6">
        Score {percentage}% ({score}/{total})
      </Text>
      <Text className="text-green-600 font-semibold mb-6">
        [+{points} Point{points !== 1 ? "s" : ""} Earned]
      </Text>
      <TouchableOpacity
        onPress={handleReturn}
        className="bg-gray-800 px-8 py-3 rounded-xl"
      >
        <Text className="text-white text-lg font-semibold">
          Return to Quizzes
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
