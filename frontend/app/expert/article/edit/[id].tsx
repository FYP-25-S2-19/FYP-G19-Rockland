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
  StyleSheet,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function EditArticleScreen() {
  const [updating, setUpdating] = useState(false);
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

const handleUpdate = async () => {
  setUpdating(true);
  try {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Title is required.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Description is required.");
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert("Error", "Please select a category.");
      return;
    }
    if (!visibility) {
      Alert.alert("Error", "Please select visibility (Free/Premium).");
      return;
    }

    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", description);
    formData.append("categories_id", selectedCategoryId.toString());
    formData.append("is_free", visibility === "Free" ? "true" : "false");

    // Append photo only if new one is chosen (uri not starting with https means newly picked)
    if (photos.length > 0 && !photos[0].uri.startsWith("https")) {
      const uriParts = photos[0].uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      formData.append("photo", {
        uri: photos[0].uri,
        name: `article_photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    // API request
    const response = await fetch(`${API_URL}/api/articles/update/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type manually, let fetch handle it for multipart/form-data
      },
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      Alert.alert("Success", "Article updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Error", result.message || "Failed to update article");
    }
  } catch (err) {
    console.error("Update article error:", err);
    Alert.alert("Error", "Something went wrong while updating the article.");
  }
  finally {
    setUpdating(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUpdate}>
            <Text style={styles.postText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <TextInput
          style={styles.rockNameInput}
          placeholder="Article Title..."
          placeholderTextColor="#A9A9A9"
          value={title}
          onChangeText={setTitle}
          underlineColorAndroid="transparent"
        />

        {/* Photos */}
        <View style={[styles.photosContainer, photos.length > 0 && styles.photosContainerNoBorder]}>
          {photos.length === 0 ? (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>
              Image preview will appear here
            </Text>
          ) : (
            <Image
              source={{ uri: photos[0].uri }}
              style={{
                width: '100%',
                aspectRatio: photos[0].width / photos[0].height,
                borderRadius: 8,
              }}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Camera & Upload buttons */}
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
            <Image source={require('../../../../assets/images/camera.png')} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Image source={require('../../../../assets/images/picture.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>

        {/* Category Dropdown */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown}>
            <Text style={styles.dropdownText}>
              {selectedCategoryId
                ? categories.find(cat => cat.categories_id === selectedCategoryId)?.title
                : 'Select Category'}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.categories_id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategoryId(category.categories_id);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    category.categories_id === selectedCategoryId && { fontWeight: 'bold' },
                  ]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Visibility */}
        <Text style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 16, marginLeft: 16 }}>
          Who can see:
        </Text>
        <View style={styles.checkboxRow}>
          {['Free', 'Premium'].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.checkboxContainer}
              onPress={() => setVisibility(option as 'Free' | 'Premium')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                { borderColor: '#76472D' },
                visibility === option && styles.checkboxChecked,
              ]}>
                {visibility === option && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.checkboxLabel,
                { color: '#76472D' },
                visibility === option && styles.checkboxLabelBold,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description */}
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description..."
          placeholderTextColor="#999"
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cancelText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 20,
  },
  postText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#459B6C',
    marginRight: 20,
  },
  rockNameInput: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    paddingVertical: 8,
    marginLeft: 20,
  },
  photosContainer: {
    marginTop: 20,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
    width: '93%',
    alignSelf: 'center',
  },
  photosContainerNoBorder: {
    borderWidth: 0,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginRight: 10,
  },
  iconButton: {
    marginLeft: 12,
    padding: 6,
    borderRadius: 8,
  },
  icon: {
    width: 18,
    height: 18,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '93%',
    alignSelf: 'center',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#000000',
    fontSize: 16,
  },
  dropdownArrow: {
    color: '#000000',
    fontSize: 16,
  },
  dropdownList: {
    marginTop: 4,
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
    width: '93%',
    alignSelf: 'center',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    color: '#000000',
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    width: '90%',
    alignSelf: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#76472D',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    lineHeight: 18,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  checkboxLabelBold: {
    fontWeight: 'bold',
  },
  descriptionInput: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlignVertical: 'top',
    marginLeft: 15,
    marginRight: 15,
  },
});