// app/article/edit/[id].tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const articleTypes = ['Igneous', 'Sedimentary', 'Metamorphic', 'Other'];

export default function EditArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [articleType, setArticleType] = useState('Article Category');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  type RarityKey = 'beginner' | 'intermediate' | 'advanced';


  const [rarity, setRarity] = useState<Record<RarityKey, boolean>>({
    beginner: false,
    intermediate: false,
    advanced: false,
  });
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; width: number; height: number }[]>([]);

  // Mock loading existing data by id - replace with your actual fetch logic
  useEffect(() => {
    async function loadArticle() {
      // Example mock: Replace with API call to fetch article by id
      const existingData = {
        title: 'Example Article Title',
        description: 'This is a detailed article description...',
        articleType: 'Igneous',
        rarity: { beginner: true, intermediate: false, advanced: true },
        image: { uri: 'https://placekitten.com/600/300' },
      };

      setTitle(existingData.title);
      setDescription(existingData.description);
      setArticleType(existingData.articleType);
      setRarity(existingData.rarity);

      if (existingData.image) {
        const imgs = Array.isArray(existingData.image) ? existingData.image : [existingData.image];
        imgs.forEach((img: any) => {
          const uri = typeof img === 'string' ? img : img.uri;
          if (uri) {
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
        });
      }
    }

    loadArticle();
  }, [id]);

  // Image picker handlers
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera roll permission needed.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      Image.getSize(
        asset.uri,
        (width, height) => setPhotos((prev) => [...prev, { uri: asset.uri, width, height }]),
        (error) => console.error(error)
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Camera permission needed.');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      Image.getSize(
        asset.uri,
        (width, height) => setPhotos((prev) => [...prev, { uri: asset.uri, width, height }]),
        (error) => console.error(error)
      );
    }
  };

  

  // Dropdown toggles and selections
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const selectArticleType = (type: string) => {
    setArticleType(type);
    setDropdownOpen(false);
  };
  const toggleRarity = (key: RarityKey) => {
    setRarity((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUpdate = () => {
    // Replace with actual update logic (API call)
    Alert.alert('Success', 'Article updated!');
    router.back();
  };

  const rarityKeys: RarityKey[] = ['beginner', 'intermediate', 'advanced'];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUpdate}>
          <Text style={styles.postText}>Update</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
          <Image source={require('../../../../assets/images/camera.png')} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
          <Image source={require('../../../../assets/images/picture.png')} style={styles.icon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity style={styles.dropdownContainer} onPress={toggleDropdown} activeOpacity={0.7}>
          <Text style={styles.dropdownText}>{articleType}</Text>
          <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {articleTypes.map((type) => (
              <TouchableOpacity key={type} style={styles.dropdownItem} onPress={() => selectArticleType(type)}>
                <Text style={[styles.dropdownItemText, type === articleType && { fontWeight: 'bold' }]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Rarity Checkboxes */}
      <View style={styles.checkboxRow}>
      {rarityKeys.map((key) => (
        <TouchableOpacity
            key={key}
            style={styles.checkboxContainer}
            onPress={() => toggleRarity(key)}
            activeOpacity={0.7}
        >
            <View
            style={[styles.checkbox, { borderColor: '#76472D' }, rarity[key] && styles.checkboxChecked]}
            >
            {rarity[key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
            style={[styles.checkboxLabel, { color: '#76472D' }, rarity[key] && styles.checkboxLabelBold]}
            >
            {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
        </TouchableOpacity>
        ))}
      </View>

      {/* Title Input */}
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
          <Text style={{ color: '#999', fontStyle: 'italic' }}>Photos will appear here...</Text>
        ) : (
          <View style={{ width: '100%' }}>
            {photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo.uri }}
                style={{ width: '100%', aspectRatio: photo.width / photo.height, borderRadius: 8, marginBottom: 10 }}
                resizeMode="contain"
              />
            ))}
          </View>
        )}
      </View>

      {/* Description Input */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
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
    marginTop: 4,
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
    justifyContent: 'space-between',
    marginTop: 20,
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
});
