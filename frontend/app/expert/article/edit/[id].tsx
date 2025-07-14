import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function EditArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const [categories, setCategories] = useState<{ categories_id: number, title: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; width: number; height: number }[]>([]);
  const [visibility, setVisibility] = useState<'Free' | 'Premium' | null>(null);
  const [isKeyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const resCat = await fetch(`${API_URL}/api/categories/all`, { headers });
      const catResult = await resCat.json();
      if (resCat.ok) setCategories(catResult.categories);

      const res = await fetch(`${API_URL}/api/articles/view/${id}`, { headers });
      const result = await res.json();
      if (res.ok) {
        const a = result.article;
        setTitle(a.title || '');
        setDescription(a.content || '');
        setSelectedCategoryId(a.categories_id || null);
        setVisibility(a.is_free ? 'Free' : 'Premium');
        if (a.signed_photo_url) {
          Image.getSize(
            a.signed_photo_url,
            (w, h) => setPhotos([{ uri: a.signed_photo_url, width: w, height: h }]),
            (err) => console.error(err)
          );
        }
      } else {
        Alert.alert("Error", result.message || "Failed to load article");
        router.replace("/expert/AllArticleScreen");
      }
    };

    if (id) fetchData();
  }, [id]);

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return alert("Permission denied");

    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      Image.getSize(asset.uri, (w, h) => {
        setPhotos([{ uri: asset.uri, width: w, height: h }]);
      });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') return alert("Permission denied");

    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      Image.getSize(asset.uri, (w, h) => {
        setPhotos([{ uri: asset.uri, width: w, height: h }]);
      });
    }
  };

  const handleUpdate = () => {
    Alert.alert("Success", "Article updated!");
    router.back();
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        className="flex-1 px-4 pt-12"
        contentContainerStyle={{ paddingBottom: isKeyboardOpen ? 300 : 160 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-base text-black">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUpdate}>
            <Text className="text-base font-bold text-green-600">Update</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <TextInput
          className="text-2xl font-bold text-black mb-4 border-b border-gray-300"
          placeholder="Article Title..."
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        {/* Image */}
        <View className={`rounded-md ${photos.length ? '' : 'border border-gray-300'} items-center justify-center py-4`}>
          {photos.length > 0 ? (
            <Image source={{ uri: photos[0].uri }} style={{ width: '100%', aspectRatio: photos[0].width / photos[0].height, borderRadius: 8 }} />
          ) : (
            <Text className="text-gray-400 italic">Image preview will appear here</Text>
          )}
        </View>

        {/* Upload icons */}
        <View className="flex-row justify-end mt-3 space-x-4">
          <TouchableOpacity onPress={takePhoto}>
            <Image source={require('../../../../assets/images/camera.png')} className="w-5 h-5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Image source={require('../../../../assets/images/picture.png')} className="w-5 h-5" />
          </TouchableOpacity>
        </View>


        <Text className="mt-4 font-semibold">Category </Text>
        {/* Dropdown */}
        <TouchableOpacity onPress={toggleDropdown} className="flex-row justify-between items-center border border-gray-400 px-4 py-3 mt-2 rounded-md">
          <Text className="text-base text-black">
            {selectedCategoryId
              ? categories.find(c => c.categories_id === selectedCategoryId)?.title
              : 'Select Category'}
          </Text>
          <Text className="text-base text-black">{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View className="mt-2 border border-gray-300 rounded-md">
            {categories.map((c) => (
              <TouchableOpacity
                key={c.categories_id}
                onPress={() => {
                  setSelectedCategoryId(c.categories_id);
                  setDropdownOpen(false);
                }}
                className="px-4 py-3"
              >
                <Text className={`text-base ${c.categories_id === selectedCategoryId ? 'font-bold' : ''}`}>{c.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Visibility */}
        <Text className="mt-6 font-semibold">Who can see:</Text>
        <View className="flex-row space-x-6 mt-2">
          {['Free', 'Premium'].map((opt) => (
            <TouchableOpacity
              key={opt}
              className="flex-row items-center"
              onPress={() => setVisibility(opt as 'Free' | 'Premium')}
            >
              <View className={`w-5 h-5 rounded-full border-2 mr-4 items-center justify-center ${visibility === opt ? 'bg-green-600 border-green-600' : 'border-green-600'}`}>
                {visibility === opt && <Text className="text-white text-xs font-bold">✓</Text>}
              </View>
              <Text className={`${visibility === opt ? 'font-bold text-green-700' : 'text-green-700'}`}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mt-8 font-semibold">Content: </Text>
        {/* Description */}
        <TextInput
          className="mt-2 min-h-[120px] p-4 border border-gray-300 rounded-md text-base text-black"
          placeholder="Description..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
