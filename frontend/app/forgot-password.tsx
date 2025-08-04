import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Verify code, 3: Set password
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    // Countdown timer - only runs when step is 2 (OTP verification)
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showAlert = (title: string, message: string, isSuccess = false) => {
    Alert.alert(title, message, [
      {
        text: "OK",
        onPress: isSuccess && step === 3 ? () => router.replace("/login") : undefined,
      },
    ]);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showAlert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showAlert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(2); // Move to OTP verification step
        setTimeLeft(900); // Reset timer to 15 minutes
        showAlert("Success", "Verification code sent to your email!");
      } else {
        showAlert("Error", data.error || "Failed to send verification code. Please try again.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      showAlert("Error", "Unable to connect to server. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      showAlert("Error", "Please enter the verification code");
      return;
    }

    if (verificationCode.trim().length !== 6) {
      showAlert("Error", "Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStep(3); // Move to password reset step
        showAlert("Success", "Code verified! Now set your new password.");
      } else {
        showAlert("Error", data.message || "Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("Code verification error:", error);
      showAlert("Error", "Unable to verify code. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert("Error", "Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      showAlert("Error", "Password must be at least 8 characters long");
      return;
    }

    // Additional password validation
    if (!/[a-zA-Z]/.test(newPassword)) {
      showAlert("Error", "Password must contain at least one letter");
      return;
    }

    if (!/\d/.test(newPassword)) {
      showAlert("Error", "Password must contain at least one number");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim(),
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert("Success", "Password reset successfully! You can now log in with your new password.", true);
      } else {
        showAlert("Error", data.message || "Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      showAlert("Error", "Unable to reset password. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/forgot-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimeLeft(900); // Reset timer to 15 minutes
        showAlert("Success", "New verification code sent to your email!");
      } else {
        showAlert("Error", "Failed to resend code. Please try again.");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      showAlert("Error", "Unable to resend code. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Reset Password";
      case 2: return "Verify Your Email";
      case 3: return "Set New Password";
      default: return "Reset Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return "Enter your email address to receive a verification code";
      case 2: return `Enter the verification code sent to ${email}`;
      case 3: return "Create a new password for your account";
      default: return "";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-green-600">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6 py-8">
            <View className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10">
              {/* Header with Back Button */}
              <View className="flex-row items-center mb-6">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mr-4 p-2"
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800">{getStepTitle()}</Text>
                </View>
              </View>

              {/* Progress Indicator */}
              <View className="flex-row items-center justify-center space-x-2 mb-6">
                <View className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-600' : 'bg-gray-300'}`} />
                <View className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
                <View className={`w-3 h-3 rounded-full ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'}`} />
              </View>

              {/* Description */}
              <Text className="text-sm text-gray-600 text-center mb-6">
                {getStepDescription()}
              </Text>

              {/* Timer - only show in step 2 */}
              {step === 2 && timeLeft > 0 && (
                <View className="bg-green-50 p-3 rounded-lg mb-6">
                  <Text className="text-sm text-green-700 text-center">
                    Code expires in: <Text className="font-semibold">{formatTime(timeLeft)}</Text>
                  </Text>
                </View>
              )}

              {/* Step 1: Enter Email */}
              {step === 1 && (
                <View>
                  <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-2">Email Address</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 text-base text-gray-800 bg-gray-50"
                      style={{ height: 48, paddingVertical: 10 }}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email address"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    className={`py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
                    onPress={handleSendOTP}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-lg font-semibold text-center">
                      {isLoading ? "Sending Code..." : "Send Verification Code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2: Verify Code */}
              {step === 2 && (
                <View>
                  <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-2">Verification Code</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-4 text-base text-gray-800 bg-gray-50 text-center tracking-widest"
                      style={{ height: 48, paddingVertical: 10 }}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={6}
                      editable={!isLoading && timeLeft > 0}
                    />
                  </View>

                  <TouchableOpacity
                    className={`py-4 rounded-lg mb-4 ${isLoading || timeLeft === 0 ? 'bg-gray-400' : 'bg-green-600'}`}
                    onPress={handleVerifyCode}
                    disabled={isLoading || timeLeft === 0}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-lg font-semibold text-center">
                      {isLoading ? "Verifying..." : "Verify Code"}
                    </Text>
                  </TouchableOpacity>

                  {/* Resend Code */}
                  <View className="items-center space-y-2">
                    <Text className="text-sm text-gray-600">Didn't receive the code?</Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={isLoading || timeLeft > 600} // Can resend after 5 minutes
                      activeOpacity={0.7}
                    >
                      <Text className={`text-sm font-medium ${timeLeft > 600 ? 'text-gray-400' : 'text-green-600'}`}>
                        {timeLeft > 600 ? `Resend available in ${formatTime(timeLeft - 600)}` : 'Resend Code'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Back to change email */}
                  <View className="items-center mt-4">
                    <TouchableOpacity
                      onPress={() => handleBackToStep(1)}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm text-gray-600">← Change email address</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3: Set New Password */}
              {step === 3 && (
                <View>
                  <View className="mb-4">
                    <Text className="text-base font-medium text-gray-700 mb-2">New Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
                      <TextInput
                        className="flex-1 px-4 text-base text-gray-800"
                        style={{ height: 48, paddingVertical: 10 }}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showNewPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        className="px-4 py-3"
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={showNewPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="text-base font-medium text-gray-700 mb-2">Confirm New Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
                      <TextInput
                        className="flex-1 px-4 text-base text-gray-800"
                        style={{ height: 48, paddingVertical: 10 }}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showConfirmPassword}
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        className="px-4 py-3"
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        activeOpacity={0.7}
                      >
                        <Ionicons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#6b7280" 
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Password Requirements */}
                  <View className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-xs text-gray-600 mb-2">Password must contain:</Text>
                    <Text className="text-xs text-gray-600">• At least 8 characters</Text>
                    <Text className="text-xs text-gray-600">• At least one letter</Text>
                    <Text className="text-xs text-gray-600">• At least one number</Text>
                  </View>

                  <TouchableOpacity
                    className={`py-4 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-lg font-semibold text-center">
                      {isLoading ? "Resetting Password..." : "Reset Password"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}