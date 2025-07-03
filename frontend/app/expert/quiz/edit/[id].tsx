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
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { quizData } from "../../../../data/quizData";
import * as ImagePicker from "expo-image-picker";
import BackIcon from "../../../../assets/images/back.svg";
import TrashIcon from "../../../../assets/images/trash.svg";
import PlusIcon from "../../../../assets/images/plus.svg";

export default function EditQuiz() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [categoriesSelected, setCategoriesSelected] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{
    question: string;
    options: string[];
    correctAnswerIndex: number;
    points: number;
  }[]>([]);

  const allCategories = [
    "Volcanic Rock",
    "Fossils",
    "Mineral & Crystal",
    "Sedimentary Rock",
    "Igneous Rock",
    "Metamorphic Rock",
    "Gemstones",
    "Meteorites",
  ];

  useEffect(() => {
    const quiz = quizData.find((q) => q.id === id);
    if (quiz) {
      setQuizTitle(quiz.title);
      setQuizDescription("This is a placeholder description");
      setDifficulty(quiz.difficulty || null);
      setCategoriesSelected(quiz.category || []);
      setQuestions(
        quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswerIndex: q.options.indexOf(q.correctAnswer),
          points: q.points || 0,
        }))
      );
    }
  }, [id]);

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: [""], correctAnswerIndex: 0, points: 0 },
    ]);
  };

  const handleSave = () => {
    console.log("Saved Quiz:", {
      title: quizTitle,
      description: quizDescription,
      categoriesSelected,
      difficulty,
      thumbnail,
      questions,
    });
    router.push("/expert/quizhome");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => setShowExitModal(true)}>
          <BackIcon width={24} height={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Edit</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-green-600 font-semibold text-base">Save</Text>
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

        <Text className="text-sm font-medium mb-1">Select Category (Optional)</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {allCategories.map((item) => {
            const isSelected = categoriesSelected.includes(item);
            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  if (isSelected) {
                    setCategoriesSelected(categoriesSelected.filter((c) => c !== item));
                  } else {
                    setCategoriesSelected([...categoriesSelected, item]);
                  }
                }}
                className={`px-4 py-2 rounded-full border ${
                  isSelected ? "border-green-600 bg-green-600" : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected ? "text-white font-semibold" : "text-gray-700"
                  }`}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm font-medium mb-1">Select Difficulty</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {["Basic", "Intermediate", "Advance", "Fun Fact"].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-full border ${
                difficulty === level ? "border-green-600 bg-green-600" : "border-gray-300"
              }`}
            >
              <Text
                className={`text-sm ${
                  difficulty === level ? "text-white font-semibold" : "text-gray-700"
                }`}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="text-base mb-1">Thumbnail Image (Optional)</Text>
          {thumbnail ? (
            <TouchableOpacity onPress={() => setThumbnail(null)} className="mb-2">
              <Image source={{ uri: thumbnail }} className="w-full h-40 rounded-lg" resizeMode="cover" />
              <Text className="text-red-500 text-sm mt-1">Remove Image</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePickImage}
              className="border border-dashed border-gray-400 py-10 rounded-lg items-center"
            >
              <Text className="text-gray-500">+ Upload Thumbnail</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="border-t border-gray-200 mb-6" />
        <Text className="text-xl font-semibold text-gray-700 mb-4 text-center">Questions</Text>

        {questions.map((q, index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-4 shadow mb-4 border border-gray-200"
            style={[shadowStyle]}
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
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
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
                      q.correctAnswerIndex === optIdx ? "bg-black border-black" : "border-gray-400"
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
                  updated[index].points = parseInt(text) || 0;
                  setQuestions(updated);
                }}
                keyboardType="number-pad"
                className="w-10 border-b border-gray-300 text-center mr-2"
              />
              <Text>points</Text>
              <TouchableOpacity className="ml-auto" onPress={() => handleDeleteQuestion(index)}>
                <TrashIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={handleAddQuestion}
        className="absolute bottom-6 right-6 bg-green-600 p-4 rounded-full"
        style={[shadowStyle]}
      >
        <PlusIcon width={24} height={24} fill="white" />
      </TouchableOpacity>

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50 px-4">
          <View className="bg-white p-6 rounded-2xl w-full max-w-[320px] items-center">
            <Text className="text-lg font-bold text-gray-900 mb-2">Discard changes?</Text>
            <Text className="text-sm text-center text-gray-500 mb-6">
              All unsaved changes will be lost. Do you want to save, discard or cancel?
            </Text>
            <View className="w-full">
              <TouchableOpacity
                className="w-full py-3 bg-green-600 rounded-lg"
                onPress={() => {
                  setShowExitModal(false);
                  handleSave();
                }}
                style={[shadowStyle]}
              >
                <Text className="text-center text-white font-medium">Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-red-600 rounded-lg mt-2"
                onPress={() => {
                  setShowExitModal(false);
                  router.back();
                }}
                style={[shadowStyle]}
              >
                <Text className="text-center text-white font-medium">Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 bg-gray-100 rounded-lg mt-2"
                onPress={() => setShowExitModal(false)}
                style={[shadowStyle]}
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
