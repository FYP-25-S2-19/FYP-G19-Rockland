import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../../../assets/images/back.svg";
import TrashIcon from "../../../../assets/images/trash.svg";
import PlusIcon from "../../../../assets/images/plus.svg";

// --- Types ---
type OptionType = {
  option_id: number | null;
  option_text: string;
};

type QuestionType = {
  question_id?: number;
  question: string;
  points: number;
  correctAnswerIndex: number | null;
  options: OptionType[];
};

type InterestType = {
  interest_id: number;
  title: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditQuiz() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Interest states
  const [interests, setInterests] = useState<InterestType[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<InterestType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- Fetch Quiz + Interests ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");

        // Fetch quiz
        const quizRes = await fetch(`${API_URL}/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const quizData = await quizRes.json();
        const quiz = quizData.quiz;

        if (!quiz) {
          Alert.alert("Quiz not found");
          return;
        }

        setQuizTitle(quiz.title);
        setQuizDescription(quiz.description);

        // Map questions
        setQuestions(
          quiz.questions.map((q: any) => ({
            question_id: q.question_id,
            question: q.question_text,
            points: q.points,
            correctAnswerIndex: q.options.findIndex((opt: any) => opt.is_correct),
            options: q.options.map((opt: any) => ({
              option_id: opt.option_id,
              option_text: opt.option_text,
            })),
          }))
        );

        // Fetch interests
        const interestRes = await axios.get(`${API_URL}/api/interests/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (interestRes.data.success) {
          setInterests(interestRes.data.interests);

          // Preselect interest if quiz has one
          if (quiz.interest_id) {
            const found = interestRes.data.interests.find(
              (i: InterestType) => i.interest_id === quiz.interest_id
            );
            if (found) setSelectedInterest(found);
          }
        }
      } catch (err) {
        console.error("❌ Failed to load data:", err);
        Alert.alert("❌ Error loading quiz or interests");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --- Save Quiz ---
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const formattedQuestions = questions.map((q) => ({
        question_id: q.question_id,
        question_text: q.question,
        points: q.points,
        options: q.options.map((opt, idx) => ({
          option_id: opt.option_id,
          option_text: opt.option_text,
          is_correct: idx === q.correctAnswerIndex,
        })),
      }));

      const payload = {
        title: quizTitle,
        description: quizDescription,
        interest_id: selectedInterest ? selectedInterest.interest_id : null, // allow null
        questions: formattedQuestions,
      };

      await axios.put(`${API_URL}/api/quizzes/${id}`, payload, { headers });

      Alert.alert("✅ Quiz updated!");
      router.push("/(expert-tabs)/quizhome");
    } catch (err) {
      console.error("Update failed", err);
      Alert.alert("❌ Failed to update quiz");
    }
  };

  // --- Delete Quiz ---
  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/api/quizzes/${id}`, { headers });
      Alert.alert("Deleted");
      router.push("/(expert-tabs)/quizhome");
    } catch (err) {
      console.error("Delete failed", err);
      Alert.alert("❌ Failed to delete quiz");
    }
  };

  const filteredInterests = interests.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#459B6C" />
        <Text className="mt-4 text-gray-500">Loading quiz...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center space-x-2 pl-5">
          <TouchableOpacity
            onPress={() => {
              if (quizTitle || quizDescription || questions.length) {
                setShowExitModal(true);
              } else {
                router.back();
              }
            }}
          >
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold pl-2">Edit Quiz</Text>
        </View>

        <View className="flex-row items-center pr-5">
          <TouchableOpacity
            onPress={() => setShowDeleteConfirm(true)}
            className="ml-4 mr-5"
          >
            <Text className="text-red-600 font-semibold text-base">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-green-600 font-semibold text-base">Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Quiz Title */}
        <Text className="text-sm font-medium mb-1">Quiz Title</Text>
        <TextInput
          value={quizTitle}
          onChangeText={setQuizTitle}
          className="text-3xl font-semibold border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        {/* Interest Dropdown (Optional) */}
        <Text className="text-sm font-medium mb-1">Interest (Optional)</Text>
        <TouchableOpacity
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text className="text-base">
            {selectedInterest ? selectedInterest.title : "Select an interest"}
          </Text>
        </TouchableOpacity>

        {/* Clear Interest Button */}
        {selectedInterest && (
          <TouchableOpacity
            onPress={() => setSelectedInterest(null)}
            className="mb-4"
          >
            <Text className="text-red-500 text-sm">Clear Interest</Text>
          </TouchableOpacity>
        )}

        {showDropdown && (
          <View className="border border-gray-300 rounded-lg mb-4">
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search interest..."
              className="p-2 border-b border-gray-200"
            />
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled={true}>
              {filteredInterests.map((item) => (
                <TouchableOpacity
                  key={item.interest_id}
                  className="p-2 border-b border-gray-200"
                  onPress={() => {
                    setSelectedInterest(item);
                    setShowDropdown(false);
                    setSearchQuery("");
                  }}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Description */}
        <Text className="text-sm font-medium mb-1">Quiz Description</Text>
        <TextInput
          value={quizDescription}
          onChangeText={setQuizDescription}
          placeholder="Quiz description"
          multiline
          className="text-base border border-gray-300 rounded-lg px-3 py-2 text-gray-700 mb-4"
        />

        {/* Questions */}
        <Text className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Questions
        </Text>

        {questions.map((q, index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-4 shadow mb-4 border border-gray-200"
          >
            <Text className="text-gray-500 text-sm mb-2">
              Question {index + 1}
            </Text>

            <TextInput
              value={q.question}
              onChangeText={(text) => {
                const updated = [...questions];
                updated[index].question = text;
                setQuestions(updated);
              }}
              placeholder="Question"
              placeholderTextColor="#9CA3AF"
              multiline
              className="text-base font-medium border border-gray-300 rounded-lg px-3 py-2 mb-4"
            />

            {/* Options */}
            {q.options.map((option: OptionType, optIdx: number) => (
              <View key={optIdx} className="flex-row items-center mb-2">
                <TouchableOpacity
                  onPress={() => {
                    const updated = [...questions];
                    updated[index].correctAnswerIndex = optIdx;
                    setQuestions(updated);
                  }}
                  className="flex-row items-center"
                >
                  <View
                    className={`w-4 h-4 rounded-full border mr-3 ${
                      q.correctAnswerIndex === optIdx
                        ? "bg-black border-black"
                        : "border-gray-400"
                    }`}
                  />
                </TouchableOpacity>
                <TextInput
                  value={option.option_text}
                  onChangeText={(text) => {
                    const updated = [...questions];
                    updated[index].options[optIdx].option_text = text;
                    setQuestions(updated);
                  }}
                  placeholder={`Option ${optIdx + 1}`}
                  className="flex-1 border-b border-gray-300 text-base"
                />
                <TouchableOpacity
                  className="ml-2"
                  onPress={() => {
                    const updated = [...questions];
                    updated[index].options.splice(optIdx, 1);
                    setQuestions(updated);
                  }}
                >
                  <Text className="text-red-500 text-3xl">×</Text>
                </TouchableOpacity>
              </View>
            ))}

            {q.options.length < 5 && (
              <TouchableOpacity
                onPress={() => {
                  const updated = [...questions];
                  updated[index].options.push({ option_text: "", option_id: null });
                  setQuestions(updated);
                }}
              >
                <Text className="text-green-600 text-sm mt-1 ml-7">
                  Add option
                </Text>
              </TouchableOpacity>
            )}

            {/* Points */}
            <View className="flex-row items-center mt-4">
              <TextInput
                value={q.points.toString()}
                onChangeText={(text) => {
                  const updated = [...questions];
                  const value = parseInt(text);
                  updated[index].points = Number.isNaN(value) ? 0 : value;
                  setQuestions(updated);
                }}
                keyboardType="number-pad"
                className="w-10 border-b border-gray-300 text-center mr-2"
              />
              <Text>points</Text>
              <TouchableOpacity
                className="ml-auto"
                onPress={() => {
                  const updated = [...questions];
                  updated.splice(index, 1);
                  setQuestions(updated);
                }}
              >
                <TrashIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Question Button */}
      <TouchableOpacity
        onPress={() => {
          if (questions.length < 50) {
            setQuestions([
              ...questions,
              {
                question: "",
                options: [{ option_id: null, option_text: "" }],
                correctAnswerIndex: null,
                points: 0,
              },
            ]);
          }
        }}
        className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full"
      >
        <PlusIcon width={24} height={24} fill="white" />
      </TouchableOpacity>

      {/* Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="bg-white p-6 rounded-2xl w-full max-w-[320px] items-center">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Discard changes?
            </Text>
            <Text className="text-sm text-center text-gray-500 mb-6">
              All unsaved changes will be lost. Do you want to save, discard or
              cancel?
            </Text>
            <View className="w-full">
              <TouchableOpacity
                className="w-full py-3 bg-green-600 rounded-lg"
                onPress={() => {
                  setShowExitModal(false);
                  handleSave();
                }}
              >
                <Text className="text-center text-white font-medium">
                  Save Changes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-red-600 rounded-lg mt-2"
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
              >
                <Text className="text-center text-white font-medium">
                  Discard
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-gray-100 rounded-lg mt-2"
                onPress={() => setShowExitModal(false)}
              >
                <Text className="text-center text-gray-700 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="bg-white p-6 rounded-2xl w-full max-w-[320px] items-center">
            <Text className="text-3xl mb-2">⚠️</Text>
            <Text className="text-lg font-bold text-gray-900 mb-2">Delete Quiz</Text>
            <Text className="text-sm text-center text-gray-500 mb-6">
              Are you sure you want to delete <Text className="font-semibold text-black">{quizTitle}</Text>?
            </Text>

            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-100 rounded-lg"
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-red-600 rounded-lg ml-3"
                onPress={() => {
                  setShowDeleteConfirm(false);
                  handleDelete();
                }}
              >
                <Text className="text-center text-white font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
