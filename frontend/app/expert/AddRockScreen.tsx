import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
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

const rockTypes = ['Igneous', 'Sedimentary', 'Metamorphic', 'Other'];

export default function AddRockScreen() {
  const navigation = useNavigation();

  const [rockType, setRockType] = useState('Igneous');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [rarity, setRarity] = useState({
    common: false,
    rare: false,
    legendary: false,
  });
  const [rockName, setRockName] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<{ uri: string; width: number; height: number }[]>([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled) {
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
  const selectRockType = (type) => {
    setRockType(type);
    setDropdownOpen(false);
  };
  const toggleRarity = (key) => {
    setRarity((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.iconButton}>
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

      {/* Dropdown */}
      <View style={{ marginTop: 20 }}>
        <TouchableOpacity
          style={styles.dropdownContainer}
          onPress={toggleDropdown}
          activeOpacity={0.7}
        >
          <Text style={styles.dropdownText}>{rockType}</Text>
          <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownList}>
            {rockTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => selectRockType(type)}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    type === rockType && { fontWeight: 'bold' },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Rarity Checkboxes */}
      <View style={styles.checkboxRow}>
        {['common', 'rare', 'legendary'].map((key) => (
          <TouchableOpacity
            key={key}
            style={styles.checkboxContainer}
            onPress={() => toggleRarity(key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                { borderColor: '#76472D' },
                rarity[key] && styles.checkboxChecked,
              ]}
            >
              {rarity[key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: '#76472D' },
                rarity[key] && styles.checkboxLabelBold,
              ]}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rock Name Input */}
      <TextInput
        style={styles.rockNameInput}
        placeholder="Rock Name..."
        placeholderTextColor="#A9A9A9"
        value={rockName}
        onChangeText={setRockName}
        underlineColorAndroid="transparent"
      />

      {/* Photos Container */}
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
              <Image
                key={index}
                source={{ uri: photo.uri }}
                style={{
                  width: '100%',
                  aspectRatio: photo.width / photo.height,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
                resizeMode="contain"
              />
            ))}
          </View>
        )}
      </View>

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

  photosContainerNoBorder: {
  borderWidth: 0,
},
});