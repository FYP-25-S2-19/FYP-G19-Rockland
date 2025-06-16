import React, { useState } from "react";
import { useRouter } from "expo-router";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import BackIcon from "../assets/images/back.svg";

export default function ExpertApplication() {
  const router = useRouter();

  const [why, setWhy] = useState("");
  const [background, setBackground] = useState("");
  const [files, setFiles] = useState<{ name: string }[]>([]);

  const [errors, setErrors] = useState({
    why: "",
    background: "",
    files: ""
  });

  const handleFileUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: true });

    if (!result.canceled) {
      const selectedFiles = result.assets.map(file => ({ name: file.name }));
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const validateAndSubmit = () => {
    const newErrors = {
      why: why.trim() === "" ? "This field is required" : "",
      background: background.trim() === "" ? "This field is required" : "",
      files: files.length === 0 ? "Please upload at least 1 file" : ""
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some(error => error !== "");
    if (!hasError) {
      console.log("Submitted:", { why, background, files });
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <BackIcon width={24} height={24} />
            </TouchableOpacity>
            <Text className="text-lg font-bold">Expert Application Form</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Why */}
          <Text className="text-base font-medium mb-2">Why do you want to become an expert?*</Text>
          <TextInput
            multiline
            className="border border-gray-300 rounded-lg bg-red-50 px-4 py-3 mb-1 h-24 text-top"
            value={why}
            onChangeText={setWhy}
            placeholder="Write your reason..."
            textAlignVertical="top"
          />
          {errors.why ? <Text className="text-red-500 mb-2">{errors.why}</Text> : null}

          {/* Background */}
          <Text className="text-base font-medium mb-2 mt-4">Describe your background and expertise?*</Text>
          <TextInput
            multiline
            className="border border-gray-300 rounded-lg bg-red-50 px-4 py-3 mb-1 h-24 text-top"
            value={background}
            onChangeText={setBackground}
            placeholder="Write your experience..."
            textAlignVertical="top"
          />
          {errors.background ? <Text className="text-red-500 mb-2">{errors.background}</Text> : null}

          {/* Upload */}
          <Text className="text-base font-medium mb-2 mt-4">Upload Portfolio/CV/Other files*</Text>
          {files.map((file, index) => (
            <View key={index} className="flex-row justify-between items-center bg-red-50 p-3 rounded-lg mb-2">
              <Text className="flex-1">{file.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveFile(index)}>
                <Text className="text-red-600 text-lg">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {errors.files ? <Text className="text-red-500 mb-2">{errors.files}</Text> : null}

          <TouchableOpacity className="bg-[#6B3F2D] py-3 rounded-xl mb-8" onPress={handleFileUpload}>
            <Text className="text-white text-center font-semibold text-base">Upload File</Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity className="bg-gray-800 py-4 rounded-xl mb-6" onPress={validateAndSubmit}>
            <Text className="text-white text-center font-semibold text-base">Submit Expert Application Form</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
