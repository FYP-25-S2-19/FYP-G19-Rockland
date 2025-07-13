import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform } from 'react-native';

export default function AddArtcleScreen() {
  const navigation = useNavigation();

  const [articleType, setarticleType] = useState('Article Category');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [visibility, setVisibility] = useState<'Free' | 'Premium' | null>(null);
  const [rockName, setRockName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; width: number; height: number }[]>([]);
  const [categories, setCategories] = useState<{ categories_id: number, title: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const API_URL = process.env.EXPO_PUBLIC_API_URL

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const res = await fetch(`${API_URL}/api/categories/all`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const result = await res.json();
        if (res.ok) {
          setCategories(result.categories);
        } else {
          console.error('Failed to load categories:', result.error);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
  
    fetchCategories();
  }, []);
  

  const submitArticle = async () => {
    if (!rockName || !description || !articleType || !visibility) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('accessToken'); // your auth token
      if (!token) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
  
      // Convert image to base64
      let photoBase64 = null;
      if (photos.length > 0) {
        const response = await fetch(photos[0].uri);
        const blob = await response.blob();
        const reader = new FileReader();
        const readAsBase64 = () =>
          new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        const base64 = (await readAsBase64()) as string;
        photoBase64 = base64;
      }
  
      const payload = {
        title: rockName,
        content: description,
        categories_id: selectedCategoryId,
        is_free: visibility === 'Free',
        photo: photoBase64,
      };
  
      const res = await fetch(`${API_URL}/api/articles/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        Alert.alert('Success', 'Article posted successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'Failed to post article');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // force 1:1 crop
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      Image.getSize(
        uri,
        (width, height) => {
          setPhotos((prev) => [...prev, { uri, width, height }]);
        },
        (error) => {
          console.error('Failed to get image size', error);
        }
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const uri = asset.uri;

      Image.getSize(
        uri,
        (width, height) => {
          setPhotos((prev) => [...prev, { uri, width, height }]);
        },
        (error) => {
          console.error('Failed to get image size', error);
        }
      );
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const selectArticleType = (type: string) => {
    setarticleType(type);
    setDropdownOpen(false);
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={submitArticle}>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <TextInput
        style={styles.rockNameInput}
        placeholder="Article Title..."
        placeholderTextColor="#A9A9A9"
        value={rockName}
        onChangeText={setRockName}
        underlineColorAndroid="transparent"
      />

      {/* Photos */}
      <View
        style={[
          styles.photosContainer,
          photos.length > 0 && styles.photosContainerNoBorder,
        ]}
      >
        {photos.length === 0 ? (
          <Text style={{ color: '#999', fontStyle: 'italic' }}>
            Photos will appear here...
          </Text>
        ) : (
          <View style={{ width: '100%' }}>
            {photos.map((photo, index) => (
            <View key={index} style={styles.imageWrapper}>
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
                style={styles.deleteButton}
                onPress={() => {
                  setPhotos((prev) => prev.filter((_, i) => i !== index));
                }}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          </View>
        )}
      </View>

      {/* Camera & Upload buttons */}
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
          <Image
            source={require('../../assets/images/camera.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Image
            source={require('../../assets/images/picture.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Category Dropdown */}
      <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        style={styles.dropdownContainer}
        onPress={toggleDropdown}
      >
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

      {/* Visibility (Free / Premium) */}
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
            <View
              style={[
                styles.checkbox,
                { borderColor: '#76472D' },
                visibility === option && styles.checkboxChecked,
              ]}
            >
              {visibility === option && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: '#76472D' },
                visibility === option && styles.checkboxLabelBold,
              ]}
            >
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    width: '93%',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 8,
    padding: 10,
  },
  photosContainerNoBorder: {
    borderWidth: 0,
  },
  descriptionInput: {
    marginTop: 20,
    fontSize: 16,
    color: '#000',
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    textAlignVertical: 'top',
    marginLeft: 15,
  },
  imageWrapper: {
    marginBottom: 10,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
    fontWeight: 'bold',
  },
});
