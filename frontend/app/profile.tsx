import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import BackIcon from "../assets/images/back.svg";
import CalendarIcon from "../assets/images/calendar.svg";
import VisibilityIcon from "../assets/images/visibility.svg";
import VisibilityOffIcon from "../assets/images/visibility_off.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";
import EditIcon from "../assets/images/edit-line.svg";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import Toast from 'react-native-toast-message';
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import TrashIcon from "../assets/images/trash.svg";
import { Modal } from "react-native"; 

export default function ProfileScreen() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("free");
  const [loading, setLoading] = useState(true);
  const [availableInterests, setAvailableInterests] = useState<string[]>([]);

  const [initialData, setInitialData] = useState<any>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [contactNumber, setContactNumber] = useState("");
  const [region, setRegion] = useState("");
  const [profileImage, setProfileImage] = useState(initialData.profile_picture);
  const [previewImage, setPreviewImage] = useState(""); // for immediate UI preview
  const [localImagePath, setLocalImagePath] = useState(""); // local path to upload later
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [profilePictureBlobPath, setProfilePictureBlobPath] = useState("");
  const [profilePicturePreviewURL, setProfilePicturePreviewURL] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showInterestDropdown, setShowInterestDropdown] = useState(false);
  const [countryCode, setCountryCode] = useState("+65");
  const [phoneNumber, setPhoneNumber] = useState("");

  const countryCodes = [
    { code: "+62", label: "🇮🇩 Indonesia" },
    { code: "+65", label: "🇸🇬 Singapore" },
    { code: "+60", label: "🇲🇾 Malaysia" },
    { code: "+63", label: "🇵🇭 Philippines" },
    { code: "+66", label: "🇹🇭 Thailand" },
    { code: "+84", label: "🇻🇳 Vietnam" },
    { code: "+95", label: "🇲🇲 Myanmar" },
    { code: "+855", label: "🇰🇭 Cambodia" },
    { code: "+856", label: "🇱🇦 Laos" },
    { code: "+673", label: "🇧🇳 Brunei" },
    { code: "+61", label: "🇦🇺 Australia" }
  ];

  const genderOptions = ["Female", "Male", "None"];

  const loadInitial = async () => {
    const role = await AsyncStorage.getItem("userRole");
    setUserRole(role || "free");

    try {
      const token = await AsyncStorage.getItem("accessToken");
      const API_URL = process.env.EXPO_PUBLIC_API_URL;

      const api = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` },
      });


      const userRes = await api.get("/api/users/me");
      const user = userRes.data.user;

      setInitialData(user);
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setPassword("");
      setDateOfBirth(user.date_of_birth || "");
      setSelectedGender(user.gender || "");
      if (user.contact_number?.startsWith("+")) {
        const matchedCode = countryCodes.find(({ code }) =>
          user.contact_number.startsWith(code)
        );
        if (matchedCode) {
          setCountryCode(matchedCode.code);
          setPhoneNumber(user.contact_number.replace(matchedCode.code, ""));
        } else {
          setPhoneNumber(user.contact_number);
        }
      }
      setRegion(user.region || "");
      setInterests(user.interests || []);
      setProfileImage(user.profile_picture); // this is the signed URL  
      setProfilePictureBlobPath(user.raw_profile_picture || "");

      const interestsRes = await api.get("/api/interests/all");
      setAvailableInterests(
        Array.isArray(interestsRes.data.interests)
          ? interestsRes.data.interests.map((i: any) => i.title)
          : []
      );
    } catch (e) {
      console.log("❌ Failed to load user or interests:", e);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      const pickedImage = result.assets[0];
      setPreviewImage(pickedImage.uri);        // 👁️ for UI
      setLocalImagePath(pickedImage.uri);      // 💾 for upload on save
    }
  };

  const handleBack = () => router.push("/account");

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFirstName(initialData.first_name);
    setLastName(initialData.last_name);
    setEmail(initialData.email);
    setPassword("");
    setDateOfBirth(initialData.date_of_birth);
    setSelectedGender(initialData.gender);
    setInterests(initialData.interests);
    setRegion(initialData.region);
    if (initialData.contact_number?.startsWith("+")) {
      const matchedCode = countryCodes.find(({ code }) =>
        initialData.contact_number.startsWith(code)
      );
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        setPhoneNumber(initialData.contact_number.replace(matchedCode.code, ""));
      } else {
        setPhoneNumber(initialData.contact_number);
      }
    }
    setIsEditing(false);
    setProfileImage(initialData.profile_picture);
    setProfilePictureBlobPath(initialData.raw_profile_picture || "");
    setLocalImagePath("");
  };

  const handleSave = async () => {
    try {

      const imageChanged =
      (localImagePath && localImagePath !== "") ||
      (profileImage === "" && initialData.profile_picture !== "");
    
    if (
      !imageChanged &&
      email === initialData.email &&
      firstName === initialData.first_name &&
      lastName === initialData.last_name &&
      dateOfBirth === initialData.date_of_birth &&
      region === initialData.region &&
      selectedGender === initialData.gender &&
      (countryCode + phoneNumber) === initialData.contact_number &&
      password === "" &&
      JSON.stringify(interests) === JSON.stringify(initialData.interests)
    ) {
      Toast.show({ type: "info", text1: "No changes to save." });
      return;
    }

      const token = await AsyncStorage.getItem("accessToken");
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      let finalBlobPath = profilePictureBlobPath;
      if (finalBlobPath.startsWith("http")) {
        throw new Error("Backend returned signed URL instead of blob path!");
      }
  
      // ✅ Upload profile image only if new image selected
      if (localImagePath) {
        const filename = localImagePath.split("/").pop() || "image.jpg";
        const mimeType = `image/${filename.split(".").pop()}`;
        const formData = new FormData();
  
        formData.append("file", {
          uri: localImagePath,
          name: filename,
          type: mimeType,
        } as any);
  
        const uploadRes = await fetch(`${API_URL}/api/upload/profile_picture`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        });
  
        const uploadData = await uploadRes.json();

        
        finalBlobPath = uploadData.blob_path;

        setProfilePictureBlobPath(finalBlobPath);
        if (finalBlobPath.startsWith("http")) {
          // ❌ BAD — this means your backend is returning a signed URL instead
          throw new Error("Backend returned signed URL instead of blob path!");
        }
      }
  
      // 📦 Now update profile info
      const res = await axios.post(
        `${API_URL}/api/users/update_user`,
        {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth,
          contact_number: countryCode + phoneNumber,
          gender: selectedGender,
          region,
          interests,
          profile_picture: finalBlobPath || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setIsEditing(false);
      setPreviewImage("");         // reset temp preview
      setLocalImagePath("");       // reset local upload state
      setProfileImage(res.data.user.profile_picture);
      setInitialData(res.data.user);
      setProfilePictureBlobPath(res.data.user.raw_profile_picture || "");

      await loadInitial();
  
      Toast.show({ type: "success", text1: "Profile updated!" });
    } catch (e) {
      console.log("❌ Failed to update user:", e);
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage("");
    setProfileImage("");
    setProfilePictureBlobPath(""); // this is what gets sent to backend as ""
    setLocalImagePath(""); 
    setShowRemoveModal(false);
  };
  


  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleToggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else if (interests.length < 3) {
      setInterests([...interests, item]);
    }
  };

  const cardStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderRadius: 16,
    backgroundColor: "white",
    padding: 20,
    marginBottom: 24,
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4ADE80" />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={userRole === 'premium'
      ? ['#F3B24B', '#FFFFFF'] // Premium: orange → light yellow
      : ['#91D29E', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
    <SafeAreaView className="flex-1 bg-transparent">
      <View className="border-b border-gray-100 px-4 py-4 bg-white">
        <View className="flex-row items-center justify-between">
          {isEditing ? (
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
              <Text className="text-gray-600 text-lg font-medium">Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleBack} activeOpacity={0.7}>
              <BackIcon width={24} height={24} />
            </TouchableOpacity>
          )}

          <Text className="text-xl font-semibold text-gray-800">Profile</Text>

          {isEditing ? (
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-green-600 text-lg font-medium">Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleEdit}>
              <Text className="text-green-600 text-lg font-medium">Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8">
          <View style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 4,
            borderRadius: 50,
          }}>
           <Image
               source={
                previewImage
                  ? { uri: previewImage }
                  : profileImage
                  ? { uri: profileImage }
                  : require("../assets/images/profilepicture.png")
              }
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#f3f4f6",
              }}
            />

{isEditing && (
  <>
    <TouchableOpacity
      onPress={pickImage}
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      }}
    >
      <EditIcon width={18} height={18} />
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => setShowRemoveModal(true)}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 6,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      }}
    >
      <TrashIcon width={18} height={18} />
    </TouchableOpacity>
  </>
)}

          
          </View>
        </View>

        {/* Account Info Card */}
        <View style={cardStyle}>
          {["First Name", "Last Name", "Email"].map((label, index) => {
            const value = [firstName, lastName, email][index];
            const setter = [setFirstName, setLastName, setEmail][index];
            return (
              <View key={index} className="mb-5">
                <Text className="text-base font-medium text-gray-700 mb-2">{label}</Text>
                <TextInput
                  className={`border rounded-lg px-4 text-base ${isEditing ? "bg-white border-gray-400" : "bg-gray-100 border-gray-200"}`}
                  value={value}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  placeholderTextColor="#9ca3af"
                  onChangeText={setter}
                  editable={isEditing}
                  style={{ height: 48, textAlignVertical: 'center', paddingVertical: Platform.OS === 'ios' ? 12 : 0, lineHeight: 18 }}
                />
              </View>
            );
          })}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Contact Number (Optional)</Text>
            <View className="flex-row items-center border rounded-lg px-3 py-2 bg-white border-gray-400">
              {/* Country code dropdown */}
              <TouchableOpacity
                disabled={!isEditing}
                onPress={() => setShowCountryDropdown((prev) => !prev)}
              >
                <Text className="text-base text-gray-800 mr-2">{countryCode}</Text>
              </TouchableOpacity>

              {/* Dropdown menu */}
              {showCountryDropdown && (
                <View className="absolute z-50 top-[60px] bg-white border border-gray-300 rounded-lg w-[150px]">
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                    {countryCodes.map(({ code, label }) => (
                      <TouchableOpacity
                        key={code}
                        onPress={() => {
                          setCountryCode(code);
                          setShowCountryDropdown(false);
                        }}
                        className="px-4 py-2"
                      >
                        <Text className="text-base text-gray-800">{label} {code}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Phone number input */}
              <TextInput
                className="flex-1 text-base text-gray-800"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="8123456789"
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          <View className="mb-1">
            <Text className="text-base font-medium text-gray-700 mb-2">Password</Text>
            <View className={`flex-row items-center rounded-lg ${isEditing ? "bg-white border border-gray-400" : "bg-gray-100 border border-gray-200"}`}>
              <TextInput
                className="flex-1 px-4 text-base text-gray-800"
                value={password}
                placeholder="Enter password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                editable={isEditing}
                style={{ height: 48, textAlignVertical: 'center', paddingVertical: Platform.OS === 'ios' ? 12 : 0, lineHeight: 18 }}
              />
              <TouchableOpacity className="px-4 py-3" onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityIcon width={20} height={20} /> : <VisibilityOffIcon width={20} height={20} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profiling Card */}
        <View style={cardStyle}>
          <Text className="text-xl font-semibold text-gray-800 mb-5">Profiling</Text>

          {/* Date of Birth */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Date of Birth</Text>
            <View className={`flex-row items-center rounded-lg px-4 ${isEditing ? "bg-white border border-gray-400" : "bg-gray-100 border border-gray-200"}`}>
              <TextInput
                className="flex-1 text-base text-gray-800"
                value={dateOfBirth}
                editable={false}
                style={{
                  height: 48,
                  textAlignVertical: 'center',
                  paddingVertical: Platform.OS === 'ios' ? 12 : 0,
                  lineHeight: 18,
                }}
              />
              <TouchableOpacity onPress={() => isEditing && setShowDatePicker(true)}>
                <CalendarIcon width={20} height={20} />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={new Date(dateOfBirth || Date.now())}
              onConfirm={(date) => {
                setDateOfBirth(formatDate(date));
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
            />
            )}
          </View>

          {/* Interest */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Interest (Optional)</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              onPress={() => isEditing && setShowInterestDropdown((prev) => !prev)}
            >
              <View className="flex-row flex-wrap items-center justify-between">
                <View className="flex-row flex-wrap gap-2 flex-1">
                  {interests.length > 0 ? (
                    interests.map((item, index) => (
                      <View key={index} className="flex-row items-center bg-[#C9E9CF] px-2.5 py-1.5 rounded-[6px]">
                        <Text className="text-gray-800 text-sm mr-1">{item}</Text>
                        {isEditing && (
                          <TouchableOpacity onPress={() => handleToggleInterest(item)}>
                            <Text className="text-sm font-bold text-gray-600">×</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text className="text-gray-400">Select up to 3</Text>
                  )}
                </View>
                <View className="ml-2">
                  <ChevronDownIcon width={18} height={18} />
                </View>
              </View>
            </TouchableOpacity>

            {showInterestDropdown && (
              <View className="border border-gray-300 rounded-lg mt-2 bg-white max-h-40">
                <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 160 }}>
                  {[...interests, ...availableInterests.filter(i => !interests.includes(i))].map((interest, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`px-4 py-2 ${interests.includes(interest) ? "bg-[#C9E9CF]" : ""}`}
                      onPress={() => handleToggleInterest(interest)}
                    >
                      <Text className={`text-base ${interests.includes(interest) ? "text-gray-800 font-semibold" : "text-gray-800"}`}>
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Region */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Region (Optional)</Text>
            <TextInput
              className={`border rounded-lg px-4 text-base ${isEditing ? "bg-white border-gray-400" : "bg-gray-100 border-gray-200"}`}
              value={region}
              placeholder="Enter your region"
              placeholderTextColor="#9ca3af"
              onChangeText={setRegion}
              editable={isEditing}
              style={{ height: 48, textAlignVertical: 'center', paddingVertical: Platform.OS === 'ios' ? 12 : 0, lineHeight: 18 }}
            />
          </View>


          {/* Gender */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Gender</Text>
            <View className="flex-row flex-wrap gap-x-6 gap-y-4">
              {genderOptions.map((gender, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center"
                  disabled={!isEditing}
                  onPress={() => setSelectedGender(gender)}
                >
                  <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-2 justify-center items-center">
                    <View
                      className={`w-2.5 h-2.5 rounded-full ${selectedGender === gender ? "bg-green-600" : "bg-transparent"}`}
                    />
                  </View>
                  <Text className="text-base text-gray-800">{gender}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="h-10" />
      </ScrollView>
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40 px-8">
          <View className="bg-white rounded-xl p-6 w-full">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Remove Profile Picture?
            </Text>
            <Text className="text-base text-gray-700 mb-6">
              This will remove your current image and set a default placeholder.
            </Text>

            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setShowRemoveModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-md mr-6"
                activeOpacity={0.8}
              >
                <Text className="text-gray-700 text-base font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleRemoveImage}
                className="bg-red-600 px-4 py-2 rounded-md"
                activeOpacity={0.8}
              >
                <Text className="text-white text-base font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </LinearGradient>
  );
}
