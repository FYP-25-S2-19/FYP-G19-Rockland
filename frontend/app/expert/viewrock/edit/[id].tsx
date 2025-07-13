import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import BackIcon from "../../../../assets/images/back.svg";

export default function EditRockScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Dummy data for initial load — replace with API call later
  const dummyRock = {
    id: id ?? "dummy-rock",
    name: "Granite",
    type: "Igneous",
    rarity: "Common",
    description:
      "Granite is a coarse-grained igneous rock composed mostly of quartz, alkali feldspar, and plagioclase.",
    funFact: "Granite is often used in buildings and monuments due to its durability.",
    properties: {
      Color: "Light-colored",
      Hardness: "6-7",
      Composition: "Quartz, Feldspar",
      Density: "2.63–2.75 g/cm³",
    },
    image: require("../../../../assets/images/granite.png"), // static local image
  };

  const [name, setName] = useState(dummyRock.name);
  const [type, setType] = useState(dummyRock.type);
  const [rarity, setRarity] = useState(dummyRock.rarity);
  const [description, setDescription] = useState(dummyRock.description);
  const [funFact, setFunFact] = useState(dummyRock.funFact);
  const [properties, setProperties] = useState<Record<string, string>>(dummyRock.properties);
  const [imageUri, setImageUri] = useState<any>(dummyRock.image);

  // Image picker helper
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Camera roll permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Save handler (replace with API call later)
  const handleSave = () => {
    Alert.alert("Saved", "Rock updated successfully!");
    router.back();
  };

  // Update property key or value
  const updateProperty = (key: string, newKey: string, newValue: string) => {
    setProperties((prev) => {
      const updated = { ...prev };
      if (key !== newKey) {
        delete updated[key];
        updated[newKey] = newValue;
      } else {
        updated[key] = newValue;
      }
      return updated;
    });
  };

  // Add new empty property
  const addProperty = () => {
    setProperties((prev) => ({ ...prev, "": "" }));
  };

  // Remove property by key
  const removeProperty = (key: string) => {
    setProperties((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="p-4">
        {/* Top bar */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white border border-gray-400 rounded-xl items-center justify-center"
          >
            <BackIcon width={20} height={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            className="bg-green-600 rounded-xl px-6 py-2"
          >
            <Text className="text-white font-bold text-lg">Save</Text>
          </TouchableOpacity>
        </View>

        {/* Image picker */}
        <TouchableOpacity
          onPress={pickImage}
          className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gray-200 items-center justify-center"
        >
          {typeof imageUri === "string" ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={imageUri}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>

        {/* Editable fields */}
        <Text className="text-2xl font-bold mb-2">Name</Text>
        <TextInput
          className="border border-gray-400 rounded-lg px-4 py-2 mb-4"
          value={name}
          onChangeText={setName}
          placeholder="Rock name"
        />

        <Text className="text-2xl font-bold mb-2">Type</Text>
        <TextInput
          className="border border-gray-400 rounded-lg px-4 py-2 mb-4"
          value={type}
          onChangeText={setType}
          placeholder="Rock type"
        />

        <Text className="text-2xl font-bold mb-2">Rarity</Text>
        <TextInput
          className="border border-gray-400 rounded-lg px-4 py-2 mb-4"
          value={rarity}
          onChangeText={setRarity}
          placeholder="Rarity (Common, Rare, Legendary)"
        />

        <Text className="text-2xl font-bold mb-2">Description</Text>
        <TextInput
          className="border border-gray-400 rounded-lg px-4 py-2 mb-4"
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          multiline
          numberOfLines={4}
        />

        <Text className="text-2xl font-bold mb-2">Fun Fact</Text>
        <TextInput
          className="border border-gray-400 rounded-lg px-4 py-2 mb-4"
          value={funFact}
          onChangeText={setFunFact}
          placeholder="Fun Fact"
          multiline
          numberOfLines={3}
        />

        {/* Properties editor */}
        <Text className="text-2xl font-bold mb-2">Properties</Text>
        {Object.entries(properties).map(([key, value]) => (
          <View key={key} className="flex-row mb-2 space-x-2 items-center">
            <TextInput
              className="flex-1 border border-gray-400 rounded-lg px-3 py-2"
              value={key}
              placeholder="Property Key"
              onChangeText={(newKey) => updateProperty(key, newKey, value)}
            />
            <TextInput
              className="flex-1 border border-gray-400 rounded-lg px-3 py-2"
              value={value}
              placeholder="Property Value"
              onChangeText={(newVal) => updateProperty(key, key, newVal)}
            />
            <TouchableOpacity
              onPress={() => removeProperty(key)}
              className="bg-red-600 rounded-lg px-3 py-2"
            >
              <Text className="text-white font-bold">X</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={addProperty}
          className="bg-blue-600 rounded-lg py-2 px-4 items-center mb-8"
        >
          <Text className="text-white font-bold">Add Property</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
