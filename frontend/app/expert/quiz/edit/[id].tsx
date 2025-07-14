import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackIcon from "../../../../assets/images/back.svg";
import TrashIcon from "../../../../assets/images/trash.svg";
import PlusIcon from "../../../../assets/images/plus.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function EditQuiz() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const quiz = data.quiz;

        if (!quiz) {
          Alert.alert("Quiz not found");
          return;
        }

        setQuizTitle(quiz.title);
        setQuizDescription(quiz.description);
        setThumbnail(null); // Removed thumbnail_blob_path reference
        setQuestions(
          quiz.questions.map((q: any) => ({
            question: q.question_text,
            options: q.options.map((opt: any) => opt.option_text),
            correctAnswerIndex: q.options.findIndex(
              (opt: any) => opt.is_correct
            ),
            points: q.points,
          }))
        );
      } catch (err) {
        console.error("❌ Failed to fetch quiz:", err);
        Alert.alert("❌ Error loading quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `${API_URL}/api/quizzes/${id}`,
        {
          title: quizTitle,
          description: quizDescription,
        },
        { headers }
      );

      Alert.alert("✅ Quiz updated!");
      router.push("/(expert-tabs)/quizhome");
    } catch (err) {
      console.error("Update failed", err);
      Alert.alert("❌ Failed to update quiz");
    }
  };

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

  const handleSearch = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}/api/quizzes/search?q=${searchText}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Search Results:", data.quizzes);
  };

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
      <TextInput
        placeholder="Search quizzes..."
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        className="border p-2 rounded mb-4"
      />

      <View className="flex-row justify-between items-center mb-4">
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
        <Text className="text-xl font-bold">Edit Quiz</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-green-600 font-semibold text-base">Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text className="text-red-600 font-semibold text-base">Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-sm font-medium mb-1">Quiz Title</Text>
        <TextInput
          value={quizTitle}
          onChangeText={setQuizTitle}
          className="text-3xl font-semibold border border-gray-300 rounded-lg px-3 py-2 mb-4"
        />

        <Text className="text-sm font-medium mb-1">Quiz Description</Text>
        <TextInput
          value={quizDescription}
          onChangeText={setQuizDescription}
          placeholder="Quiz description"
          multiline
          className="text-base border border-gray-300 rounded-lg px-3 py-2 text-gray-700 mb-4"
        />

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

            {q.options.map((option, optIdx) => (
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
                <Text className="text-green-600 text-sm mt-1 ml-7">
                  Add option
                </Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center mt-4">
              <TextInput
                value={q.points.toString()}
                onChangeText={(text) => {
                  const updated = [...questions];
                  updated[index].points = parseInt(text) || 0;
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
    </SafeAreaView>
  );
}
