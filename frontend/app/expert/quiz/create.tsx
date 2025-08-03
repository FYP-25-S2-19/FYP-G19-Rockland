import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../../assets/images/back.svg";
import PlusIcon from "../../../assets/images/plus.svg";
import TrashIcon from "../../../assets/images/trash.svg";

type QuestionType = {
  question: string;
  options: string[];
  correctAnswerIndex: number | null;
  points: number;
};

export default function CreateQuiz() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [showExitModal, setShowExitModal] = useState(false);

  // Quiz info
  const [quizTitle, setQuizTitle] = useState("Quiz Title");
  const [quizDescription, setQuizDescription] = useState("");

  // Interest dropdown
  const [interests, setInterests] = useState<any[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Questions
  const [questions, setQuestions] = useState<QuestionType[]>([
    {
      question: "",
      options: [""],
      correctAnswerIndex: null,
      points: 0,
    },
  ]);

  // Fetch interests
  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await axios.get(`${API_URL}/api/interests/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          // Add a "None" option at the top
          const noneOption = { interest_id: null, title: "None (All)" };
          setInterests([noneOption, ...res.data.interests]);
        }
      } catch (err) {
        console.error("Failed to load interests:", err);
      }
    };
    fetchInterests();
  }, []);

  const filteredInterests = interests.filter((i) =>
    i.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectInterest = (interest: any) => {
    setSelectedInterest(interest);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleCreateQuiz = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Send null if no interest selected
      const quizRes = await axios.post(
        `${API_URL}/api/quizzes`,
        {
          title: quizTitle,
          description: quizDescription,
          interest_id: selectedInterest ? selectedInterest.interest_id : null,
        },
        { headers }
      );

      const quizId = quizRes.data.quiz_id;

      // Add questions
      for (const q of questions) {
        await axios.post(
          `${API_URL}/api/quizzes/${quizId}/questions`,
          {
            question: q.question,
            options: q.options,
            correctAnswerIndex: q.correctAnswerIndex,
            points: q.points,
          },
          { headers }
        );
      }

      Alert.alert("✅ Success", "Quiz created successfully!");
      router.push("/quizhome");
    } catch (err) {
      console.error("Quiz creation failed", err);
      Alert.alert("❌ Error", "Failed to create quiz.");
    }
  };

  const renderQuestionCard = (q: QuestionType, index: number) => (
    <View
      key={index}
      className="bg-white rounded-xl p-4 shadow mb-4 border border-gray-200"
    >
      <Text className="text-gray-500 text-sm mb-2">Question {index + 1}</Text>

      <TextInput
        value={q.question}
        onChangeText={(text) => {
          const updated = [...questions];
          updated[index].question = text;
          setQuestions(updated);
        }}
        placeholder="Question"
        multiline
        className="text-base border border-gray-300 rounded-lg px-3 py-2 mb-4"
      />

      {q.options.map((option: string, optIdx: number) => (
        <View key={optIdx} className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => {
              const updated = [...questions];
              updated[index].correctAnswerIndex = optIdx;
              setQuestions(updated);
            }}
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
            value={option}
            onChangeText={(text) => {
              const updated = [...questions];
              updated[index].options[optIdx] = text;
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
            updated[index].options.push("");
            setQuestions(updated);
          }}
        >
          <Text className="text-green-600 text-sm mt-1 ml-7">Add option</Text>
        </TouchableOpacity>
      )}

      <View className="flex-row items-center mt-4">
        <TextInput
          value={q.points.toString()}
          onChangeText={(text) => {
            const updated = [...questions];
            updated[index].points = Math.max(0, parseInt(text) || 0);
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
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => setShowExitModal(true)}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Create</Text>
        <TouchableOpacity onPress={handleCreateQuiz}>
          <Text className="text-green-600 font-semibold text-base">Create</Text>
        </TouchableOpacity>
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
            {selectedInterest ? selectedInterest.title : "None (All)"}
          </Text>
        </TouchableOpacity>

        {showDropdown && (
          <View
            className="border border-gray-300 rounded-lg mb-4"
            style={{ maxHeight: 200 }}
          >
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search interest..."
              className="p-2 border-b border-gray-200"
            />
            <ScrollView
              style={{ maxHeight: 200 }}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
            >
              {filteredInterests.map((item) => (
                <TouchableOpacity
                  key={item.interest_id ?? "none"}
                  className="p-2 border-b border-gray-200"
                  onPress={() => handleSelectInterest(item)}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quiz Description */}
        <Text className="text-sm font-medium mb-1">Quiz Description</Text>
        <TextInput
          value={quizDescription}
          onChangeText={setQuizDescription}
          multiline
          className="text-base border border-gray-300 rounded-lg px-3 py-2 text-gray-600 mb-4"
        />

        {/* Questions */}
        <View className="items-center mb-4">
          <Text className="text-xl font-semibold text-gray-700">Questions</Text>
        </View>

        {questions.map((q, index) => renderQuestionCard(q, index))}
      </ScrollView>

      {/* Add Question Button */}
      <TouchableOpacity
        onPress={() => {
          if (questions.length < 50) {
            setQuestions([
              ...questions,
              { question: "", options: [""], correctAnswerIndex: null, points: 0 },
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
              Exit without saving?
            </Text>
            <Text className="text-sm text-center text-gray-500 mb-6">
              All progress will be lost. Do you want to save as draft or discard?
            </Text>
            <View className="w-full">
              <TouchableOpacity
                className="w-full py-3 bg-green-600 rounded-lg"
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
              >
                <Text className="text-center text-white font-medium">
                  Save as Draft
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-red-600 rounded-lg mt-2"
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
              >
                <Text className="text-center text-white font-medium">Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-gray-100 rounded-lg mt-2"
                onPress={() => setShowExitModal(false)}
              >
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
