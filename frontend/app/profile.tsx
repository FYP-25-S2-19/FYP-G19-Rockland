import { useState } from "react";
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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BackIcon from "../assets/images/back.svg";
import CalendarIcon from "../assets/images/calendar.svg";
import VisibilityIcon from "../assets/images/visibility.svg";
import VisibilityOffIcon from "../assets/images/visibility_off.svg";
import ChevronDownIcon from "../assets/images/chevron-down.svg";
import EditIcon from "../assets/images/edit-line.svg";

export default function ProfileScreen() {
  const router = useRouter();

  const initial = {
    firstName: "Lois",
    lastName: "Becket",
    email: "Loisbecket@gmail.com",
    password: "password123",
    dateOfBirth: "18/03/1990",
    interests: ["Volcanic Rock", "Fossils", "Mineral & Crystal"],
    selectedGender: "Female",
  };

  const [initialData, setInitialData] = useState(initial);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState(initial.password);
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth);
  const [selectedGender, setSelectedGender] = useState(initial.selectedGender);
  const [interests, setInterests] = useState(initial.interests);

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const genderOptions = ["Female", "Male", "Rather not say"];
  const availableInterests = [
    "Volcanic Rock",
    "Fossils",
    "Mineral & Crystal",
    "Sedimentary Rock",
    "Igneous Rock",
    "Metamorphic Rock",
    "Gemstones",
    "Meteorites",
  ];

  const handleBack = () => router.push("/account");

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setFirstName(initialData.firstName);
    setLastName(initialData.lastName);
    setEmail(initialData.email);
    setPassword(initialData.password);
    setDateOfBirth(initialData.dateOfBirth);
    setSelectedGender(initialData.selectedGender);
    setInterests(initialData.interests);
    setIsEditing(false);
  };

  const handleSave = () => {
    setInitialData({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      interests,
      selectedGender,
    });
    setIsEditing(false);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDateOfBirth(`${day}/${month}/${year}`);
    }
    setShowDatePicker(false);
  };

  const handleToggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      if (interests.length < 3) {
        setInterests([...interests, item]);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="border-b border-gray-100 px-4 py-4">
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
              source={require("../assets/images/profilepicture.png")}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#f3f4f6",
              }}
            />

            {isEditing && (
              <TouchableOpacity
                onPress={() => {
                  // TODO: Handle image selection
                  console.log("Change profile picture");
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  padding: 6,
                  elevation: 3, // for Android shadow
                  shadowColor: "#000", // for iOS shadow
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <EditIcon width={16} height={16} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="mb-8">
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

        <View className="mb-8">
          <Text className="text-xl font-semibold text-gray-800 mb-5">Profiling</Text>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Date of Birth</Text>
            <View className={`flex-row items-center rounded-lg px-4 ${
              isEditing ? "bg-white border border-gray-400" : "bg-gray-100 border border-gray-200"
            }`}>
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
              <DateTimePicker
                value={new Date(dateOfBirth.split("/").reverse().join("-"))}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
              />
            )}
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Interest</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
              onPress={() => isEditing && setShowDropdown((prev) => !prev)}
            >
              <View className="flex-row flex-wrap items-center justify-between">
                <View className="flex-row flex-wrap gap-2 flex-1">
                  {interests.length > 0 ? (
                    interests.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row items-center bg-[#C9E9CF] px-2.5 py-1.5 rounded-[6px]"
                      >
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

            {showDropdown && (
              <View className="border border-gray-300 rounded-lg mt-2 bg-white max-h-40">
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: 160 }}
                >
                  {[...interests, ...availableInterests.filter(i => !interests.includes(i))].map((interest, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`px-4 py-2 ${
                        interests.includes(interest) ? "bg-[#C9E9CF]" : ""
                      }`}
                      onPress={() => handleToggleInterest(interest)}
                    >
                      <Text
                        className={`text-base ${
                          interests.includes(interest)
                            ? "text-gray-800 font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

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
                      className={`w-2.5 h-2.5 rounded-full ${
                        selectedGender === gender ? "bg-green-600" : "bg-transparent"
                      }`}
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
    </SafeAreaView>
  );
}
