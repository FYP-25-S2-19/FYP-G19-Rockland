import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import BackIcon from "../../assets/images/back.svg";
import PlusIcon from "../../assets/images/addicon.svg";
import EditIcon from "../../assets/images/edit-line.svg";
import TrashIcon from "../../assets/images/trash.svg";
import SearchIcon from "../../assets/images/search.svg";
import { quizData } from "../../data/quizData";

const getQuizImage = (id: string) => {
  switch (id) {
    case "basic":
    case "intermediate":
    case "trivella":
      return require("../../assets/images/rock_background.jpg");
    default:
      return require("../../assets/images/rock_background.jpg");
  }
};

export default function ExpertQuizHome() {
  const router = useRouter();
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<any>(null);

  const handleDeleteConfirmed = (quizId: string) => {
    console.log("Deleting quiz ID:", quizId);
    setShowDeleteModal(false);
  };

  const handleStartQuiz = () => {
    if (selectedQuizId) {
      router.push(`/quiz/${selectedQuizId}`);
      setModalVisible(false);
    }
  };

  const filteredQuizzes = quizData.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-4 mb-4 relative">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 mt-2">
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">My Quizzes</Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-3">
          <SearchIcon width={24} height={24} />
          <TextInput
            placeholder="Search quizzes..."
            value={searchText}
            onChangeText={setSearchText}
            className="flex-1 px-2 py-3 text-base text-gray-800"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Quiz Cards */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {filteredQuizzes.map((quiz) => (
          <View
            key={quiz.id}
            className="mb-4 rounded-[12px] overflow-hidden border border-black relative"
          >
            <ImageBackground
              source={getQuizImage(quiz.id)}
              resizeMode="cover"
              className="h-28 justify-center items-center"
            >
              <View className="absolute inset-0 bg-gray-800 opacity-70 rounded-[12px]" />

              <Text className="text-lg font-bold text-white z-10">{quiz.title}</Text>
              <Text className="text-sm text-white z-10">
                {quiz.points} pts ({quiz.questions.length} Questions)
              </Text>

              {/* Edit/Delete Icons */}
              <View className="absolute top-2 right-2 flex-row gap-2 z-20">
                <TouchableOpacity onPress={() => router.push(`/expert/quiz/edit/${quiz.id}`)}>
                  <EditIcon width={24} height={24} fill="white"/>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setQuizToDelete(quiz);
                    setShowDeleteModal(true);
                  }}
                >
                  <TrashIcon width={24} height={24}fill="white" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* Floating + Button */}
      <TouchableOpacity
        onPress={() => router.push("/expert/quiz/create")}
        className="absolute bottom-10 right-6 bg-[#459B6C] p-4 rounded-full shadow-lg"
      >
        <PlusIcon width={36} height={36} fill="white"/>
      </TouchableOpacity>

      {/* Delete Confirmation Modal */}
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
              Are you sure you want to delete
              <Text className="font-semibold text-black"> {quizToDelete?.title}</Text>?
            </Text>
            <Text className="text-xs text-center text-gray-400 mb-6">
              {quizToDelete?.questions.length} questions • {quizToDelete?.points} pts
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
                  if (quizToDelete) handleDeleteConfirmed(quizToDelete.id);
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
