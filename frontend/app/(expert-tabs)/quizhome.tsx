import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PlusIcon from "../../assets/images/addicon.svg";
import EditIcon from "../../assets/images/edit-line.svg";
import TrashIcon from "../../assets/images/trash.svg";
import SearchIcon from "../../assets/images/search.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ExpertQuizHome() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);

  /** Fetch quizzes created by expert */
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/quizzes/search?q=${searchText}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setQuizzes(data.quizzes || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      Alert.alert("Error", "Unable to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  /** Delete quiz logic */
  const handleDeleteConfirmed = async (quizId: number) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.quiz_id !== quizId));
        setShowDeleteModal(false);
      } else {
        const error = await res.text();
        console.error("Failed to delete quiz:", error);
        Alert.alert("Error", "Failed to delete quiz");
      }
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "An error occurred while deleting the quiz.");
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-[#FFFFFF]">
      {/* Header */}
      <View className="border-b border-gray-100 px-4 py-4 bg-white">
        <View className="flex-row items-center justify-center">
          <Text className="text-xl font-semibold text-gray-800">My Quizzes</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-3 mb-4">
          <SearchIcon width={20} height={20} />
          <TextInput
            placeholder="Search quizzes..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={fetchQuizzes}
            className="flex-1 px-2 py-3 text-base text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Quiz Cards */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#459B6C" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          {filteredQuizzes.map((quiz) => (
            <View
              key={`quiz-${quiz.quiz_id}`}
              className="bg-white rounded-xl mb-4 p-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4, // Android
              }}
            >
              <Text className="text-lg font-bold text-black mb-1">{quiz.title}</Text>
             <Text className="text-xs text-green-700 mb-1">
                Interest: {quiz.interest || "All"}
              </Text>

              <Text className="text-sm text-gray-700 mb-2">
                {quiz.description || "No description provided"}
              </Text>

              <Text className="text-xs text-gray-500 mb-3">
                {quiz.question_count || 0} Questions • {quiz.total_points || 0} Points
              </Text>

              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => router.push(`/expert/quiz/edit/${quiz.quiz_id}`)}
                >
                  <EditIcon width={20} height={20} fill="black" />
                  <Text className="ml-1 mr-2 text-sm text-gray-800">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    setQuizToDelete(quiz);
                    setShowDeleteModal(true);
                  }}
                >
                  <TrashIcon width={20} height={20} fill="red" />
                  <Text className="ml-1 text-sm text-red-600">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => router.push("/expert/quiz/create")}
        className="absolute bottom-10 right-6 bg-[#459B6C] p-4 rounded-full shadow-lg"
      >
        <PlusIcon width={36} height={36} fill="white" />
      </TouchableOpacity>

      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="bg-white p-6 rounded-2xl w-full max-w-[320px] items-center">
            <Text className="text-3xl mb-2">⚠️</Text>
            <Text className="text-lg font-bold text-gray-900 mb-2">Delete quiz</Text>
            <Text className="text-sm text-center text-gray-500 mb-3">
              {`Are you sure you want to delete ${quizToDelete?.title || ""}?`}
            </Text>
            <Text className="text-xs text-center text-gray-400 mb-6">
              {quizToDelete?.question_count || 0} questions •{" "}
              {quizToDelete?.total_points || 0} pts
            </Text>

            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-100 rounded-lg"
                onPress={() => setShowDeleteModal(false)}
              >
                <Text className="text-center text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 bg-red-600 rounded-lg ml-3"
                onPress={() => {
                  if (quizToDelete) handleDeleteConfirmed(quizToDelete.quiz_id);
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
