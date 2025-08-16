import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import BackIcon from "../assets/images/back.svg";
import VisibilityIcon from "../assets/images/visibility.svg";
import VisibilityOffIcon from "../assets/images/visibility_off.svg";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error messages
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleChangePassword = async () => {
    let hasError = false;
    const newErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };

    // Current password required
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
      hasError = true;
    }

    // New password validation with updated rules
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
      hasError = true;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
      hasError = true;
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 letter";
      hasError = true;
    } else if (!/\d/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least 1 number";
      hasError = true;
    } else {
      // Check for common weak passwords
      const commonPasswords = [
        'password', 'password123', '123456', '123456789', 'qwerty',
        'abc123', 'password1', 'admin', 'letmein', 'welcome',
        'monkey', '1234567890', 'dragon', 'princess', 'football',
        'passw0rd', 'qwerty123', 'admin123'
      ];
      
      if (commonPasswords.includes(newPassword.toLowerCase())) {
        newErrors.newPassword = "This password is too common. Please choose a stronger password";
        hasError = true;
      }
    }

    // Confirm password check
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("accessToken");

      await axios.post(
        `${API_URL}/api/users/change_password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success toast
      Toast.show({
        type: "success",
        text1: "Password Updated",
        text2: "Your password has been changed successfully.",
        visibilityTime: 2000,
      });

      // Navigate back after short delay
      setTimeout(() => {
        router.back();
      }, 2000);

    } catch (err: any) {
      const backendMessage = err.response?.data?.message || "Failed to change password";

      // If backend error is about current password, show inline
      if (backendMessage.toLowerCase().includes("current")) {
        setErrors((prev) => ({ ...prev, currentPassword: backendMessage }));
      } else if (backendMessage.toLowerCase().includes("password")) {
        // If it's about the new password
        setErrors((prev) => ({ ...prev, newPassword: backendMessage }));
      } else {
        // Show toast for general errors
        Toast.show({
          type: "error",
          text1: "Error",
          text2: backendMessage,
          visibilityTime: 2500,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordField = (
    label: string,
    value: string,
    setValue: (text: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    error?: string
  ) => (
    <View className="mb-6">
      <Text className="text-base font-medium mb-2">{label}</Text>
      <View
        className={`flex-row items-center border rounded-lg px-4 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <TextInput
          className="flex-1 py-3 text-base"
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={setValue}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pl-2">
          {showPassword ? (
            <VisibilityIcon width={20} height={20} />
          ) : (
            <VisibilityOffIcon width={20} height={20} />
          )}
        </TouchableOpacity>
      </View>
      {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5">
        {/* Header */}
        <View className="flex-row items-center justify-center mb-8 relative">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-0">
            <BackIcon width={24} height={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Change Password</Text>
        </View>

        {renderPasswordField(
          "Current Password",
          currentPassword,
          setCurrentPassword,
          showCurrentPassword,
          setShowCurrentPassword,
          errors.currentPassword
        )}
        {renderPasswordField(
          "New Password",
          newPassword,
          setNewPassword,
          showNewPassword,
          setShowNewPassword,
          errors.newPassword
        )}
        {renderPasswordField(
          "Confirm New Password",
          confirmPassword,
          setConfirmPassword,
          showConfirmPassword,
          setShowConfirmPassword,
          errors.confirmPassword
        )}

        {/* Save Button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handleChangePassword}
          className={`py-4 rounded-xl items-center ${
            loading ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Updating..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}