import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rockTypes = ['Igneous Rock', 'Sedimentary Rock', 'Metamorphic Rock'];
const rarityOptions = ['common', 'rare', 'legendary'];

type Photo = {
  uri: string;
  width: number;
  height: number;
  loading?: boolean;
};

export default function AddRockScreen() {
  const navigation = useNavigation();
  const API_URL = process.env.EXPO_PUBLIC_API_URL


  const [rockName, setRockName] = useState<string>('');
  const [rockType, setRockType] = useState<string>('Igneous Rock');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [rarity, setRarity] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [hardness, setHardness] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [composition, setComposition] = useState<string>('');
  const [density, setDensity] = useState<string>('');
  const [commonLocation, setCommonLocation] = useState<string>('');
  const [funFact, setFunFact] = useState<string>('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission denied!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      const loadingPhoto = { uri, width: 1, height: 1, loading: true };
      setPhotos((prev) => [...prev, loadingPhoto]);

      setTimeout(() => {
        Image.getSize(uri, (width, height) => {
          setPhotos((prev) =>
            prev.map((p) => (p.uri === uri ? { uri, width, height, loading: false } : p))
          );
        });
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
  
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("No access token found");
  
      let photoBase64 = null;
      if (photos.length > 0) {
        const fileUri = photos[0].uri;
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        photoBase64 = `data:image/jpeg;base64,${fileBase64}`;
      }
  
      const payload = {
        rock_name: rockName,
        rock_type: rockType,
        rarity,
        description,
        hardness,
        color,
        composition,
        density,
        common_location: commonLocation,
        fun_fact: funFact,
        photo: photoBase64, // include base64 if image picked
      };
  
      const response = await axios.post(
        `${API_URL}/api/rocks/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.success) {
        alert("✅ Rock added successfully!");
        navigation.goBack();
      } else {
        alert(`❌ ${response.data.message}`);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || "Unexpected error";
    
        if (err.response?.status === 409) {
          alert("⚠️ Rock already exists with that name!");
        } else {
          alert(`❌ ${message}`);
        }
      } else {
        alert("❌ Something went wrong. Please try again.");
      }
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  };

  const validateFields = () => {
    const newErrors: Record<string, string> = {};

    if (!rockName.trim()) newErrors.rockName = 'Rock name is required';
    if (!rockType.trim()) newErrors.rockType = 'Rock type is required';
    if (!rarity.trim()) newErrors.rarity = 'Please select rarity';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!funFact.trim()) newErrors.funFact = 'Fun fact is required';

    if (!(hardness.trim() || color.trim() || composition.trim() || density.trim())) {
      newErrors.details = 'At least one detail is required (hardness, color, composition, or density)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const selectRockType = (type: string) => {
    setRockType(type);
    setDropdownOpen(false);
  };

  const selectRarity = (option: string) => {
    setRarity((prev) => (prev === option ? '' : option));
  };

  return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: '#fff' }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120, paddingHorizontal: 16, paddingTop: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Buttons */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ fontSize: 16, color: 'black' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={{ fontSize: 16, color: 'green', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
          </View>
          {/* Photo Section */}
          <Text className="text-sm font-semibold text-gray-600 pt-5 mb-2">Rock Photo</Text>
          <View
            className={`min-h-[100px] border border-dashed border-gray-300 rounded-lg items-center justify-center w-[93%] self-center px-3 py-2 mb-4 ${
              photos.length > 0 ? 'border-0' : ''
            }`}
          >
            {photos.length === 0 ? (
              <Text className="text-gray-400 italic">Photos will appear here...</Text>
            ) : (
              <View className="w-full">
                {photos.map((photo, index) => (
                  <View key={index} className="mb-4 relative">
                    <Image
                      source={{ uri: photo.uri }}
                      style={{
                        width: '100%',
                        aspectRatio: photo.width / photo.height,
                        borderRadius: 8,
                      }}
                      resizeMode="contain"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-black/60 rounded-full w-6 h-6 items-center justify-center z-10"
                      onPress={() => removePhoto(photo.uri)}
                    >
                      <Text className="text-white text-sm font-bold">×</Text>
                    </TouchableOpacity>
                    {photo.loading && (
                      <View className="absolute top-0 left-0 right-0 bottom-0 bg-white/70 items-center justify-center rounded-lg">
                        <ActivityIndicator size="small" color="#000" />
                        <Text className="text-xs text-gray-700 mt-2">Uploading...</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Upload Buttons */}
          <View className="flex-row justify-end pr-2 mb-4">
            <TouchableOpacity className="ml-3 p-1" onPress={() => alert('Camera pressed')}>
              <Image source={require('../../assets/images/camera.png')} className="w-[18px] h-[18px]" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-3 p-1" onPress={pickImage}>
              <Image source={require('../../assets/images/picture.png')} className="w-[18px] h-[18px]" />
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <Text className="text-sm font-semibold text-gray-600 mb-1">Rock Name</Text>
          <TextInput
            className="mb-1 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. Granite"
            placeholderTextColor="#bcbcbc"
            value={rockName}
            onChangeText={setRockName}
          />
          {errors.rockName && <Text className="text-red-500 text-xs mb-2">{errors.rockName}</Text>}

          <Text className="text-sm font-semibold text-gray-600 mb-1">Rock Type</Text>
          <TouchableOpacity
            className="flex-row justify-between items-center border border-black rounded-xl py-3 px-4 mb-1 bg-white"
            onPress={toggleDropdown}
          >
            <Text className="text-base text-black">{rockType}</Text>
            <Text className="text-base text-black">{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View className="border border-black rounded-lg bg-white shadow mb-2">
              {rockTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => selectRockType(type)}
                  className="px-4 py-3"
                >
                  <Text className={`text-base text-black ${type === rockType ? 'font-bold' : ''}`}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {errors.rockType && <Text className="text-red-500 text-xs mb-2">{errors.rockType}</Text>}

          <Text className="text-sm font-semibold text-gray-600 mb-2">Rarity</Text>
          <View className="flex-row justify-between mb-2">
            {rarityOptions.map((key) => (
              <TouchableOpacity
                key={key}
                className="flex-row items-center"
                onPress={() => selectRarity(key)}
              >
                <View
                  className={`w-4 h-4 border rounded mr-2 items-center justify-center border-[#76472D] ${
                    rarity === key ? 'bg-[#76472D]' : ''
                  }`}
                >
                  {rarity === key && <Text className="text-white text-[14px] font-bold">✓</Text>}
                </View>
                <Text className={`text-base text-[#76472D] ${rarity === key ? 'font-bold' : ''}`}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.rarity && <Text className="text-red-500 text-xs mb-2">{errors.rarity}</Text>}

          <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
          <TextInput
            className="mb-1 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[80px]"
            placeholder="e.g. Granite is a coarse-grained intrusive rock..."
            placeholderTextColor="#bcbcbc"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
          />
          {errors.description && <Text className="text-red-500 text-xs mb-2">{errors.description}</Text>}

          <Text className="text-sm font-semibold text-gray-600 mb-1">Hardness</Text>
          <TextInput
            className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. 6 - 7"
            placeholderTextColor="#bcbcbc"
            value={hardness}
            onChangeText={setHardness}
          />

          <Text className="text-sm font-semibold text-gray-600 mb-1">Color</Text>
          <TextInput
            className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. White, Pink, Gray"
            placeholderTextColor="#bcbcbc"
            value={color}
            onChangeText={setColor}
          />

          <Text className="text-sm font-semibold text-gray-600 mb-1">Composition</Text>
          <TextInput
            className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. Quartz, Feldspar, Mica"
            placeholderTextColor="#bcbcbc"
            value={composition}
            onChangeText={setComposition}
          />

          <Text className="text-sm font-semibold text-gray-600 mb-1">Density</Text>
          <TextInput
            className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. 2.65 - 2.75 g/cm³"
            placeholderTextColor="#bcbcbc"
            value={density}
            onChangeText={setDensity}
          />
          {errors.details && <Text className="text-red-500 text-xs mb-2">{errors.details}</Text>}

          <Text className="text-sm font-semibold text-gray-600 mb-1">Common Location</Text>
          <TextInput
            className="mb-2 px-4 py-3 rounded-lg border border-gray-200 text-base"
            placeholder="e.g. Bukit Timah, Pulau Ubin, etc."
            placeholderTextColor="#bcbcbc"
            value={commonLocation}
            onChangeText={setCommonLocation}
          />

          <Text className="text-sm font-semibold text-gray-600 mb-1">Fun Fact</Text>
          <TextInput
            className="mb-10 px-4 py-3 rounded-lg border border-gray-200 text-base min-h-[80px]"
            placeholder="e.g. Pulau Ubin once had multiple granite quarries..."
            placeholderTextColor="#bcbcbc"
            value={funFact}
            onChangeText={setFunFact}
            multiline
            textAlignVertical="top"
          />
          {errors.funFact && <Text className="text-red-500 text-xs mb-4">{errors.funFact}</Text>}
        </ScrollView>
    </KeyboardAvoidingView>
  );
}
