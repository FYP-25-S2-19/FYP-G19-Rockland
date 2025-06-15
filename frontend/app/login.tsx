import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (email === "test@rockland.com" && password === "rock123") {
      router.replace("/home");
    } else {
      alert("Invalid email or password");
    }
  };

  const handleRegister = () => {
    console.log("Navigate to register");
  };

  const handleForgotPassword = () => {
    console.log("Navigate to forgot password");
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  return (
    <SafeAreaView className="flex-1 bg-green-600">
      <View className="flex-1 justify-center px-6">
        <View className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Login</Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500">Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                <Text className="text-sm text-green-600 font-medium">Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3.5 text-base text-gray-800 bg-gray-50"
              textAlignVertical="center"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-700 mb-2">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50">
              <TextInput
                className="flex-1 px-4 py-3 text-base text-gray-800"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text className="text-lg">{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me and Forgot Password */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 border-2 rounded border-gray-300 mr-2 items-center justify-center ${rememberMe ? "bg-green-600 border-green-600" : ""}`}
              >
                {rememberMe && <Text className="text-white text-xs font-bold">✓</Text>}
              </View>
              <Text className="text-sm text-gray-700">Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text className="text-sm text-green-600 font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-lg mb-6"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold text-center">Log In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-sm text-gray-500">Or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-lg"
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: "/placeholder.svg?height=20&width=20" }}
              className="w-5 h-5 mr-3"
            />
            <Text className="text-base font-medium text-gray-700">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
