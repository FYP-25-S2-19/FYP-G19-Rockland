import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VisibilityOn from "../assets/images/visibility.svg";
import VisibilityOff from "../assets/images/visibility_off.svg";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();

  // --- Load saved credentials on mount ---
  useEffect(() => {
    const loadRemembered = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberedEmail");
        const savedPassword = await AsyncStorage.getItem("rememberedPassword");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (err) {
        console.error("Error loading remembered credentials:", err);
      }
    };
    loadRemembered();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/login/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      const raw = await response.text();

      if (contentType && contentType.includes("application/json")) {
        const result = JSON.parse(raw);

        if (result.success) {
          const user = result.user;
          const role = user.user_type_name?.toLowerCase() || "free";

          // Save token and user data
          await AsyncStorage.setItem("accessToken", result.access_token);
          await AsyncStorage.setItem("userRole", role);
          await AsyncStorage.setItem("userData", JSON.stringify(user));
          await AsyncStorage.setItem("userId", user.user_id.toString());

          // --- Save or clear remembered credentials ---
          if (rememberMe) {
            await AsyncStorage.setItem("rememberedEmail", email);
            await AsyncStorage.setItem("rememberedPassword", password);
          } else {
            await AsyncStorage.removeItem("rememberedEmail");
            await AsyncStorage.removeItem("rememberedPassword");
          }

          // Navigate based on role
          if (role === "expert") {
            router.replace("/(expert-tabs)/home");
          } else {
            router.replace("/(tabs)/home");
          }
        } else {
          alert(result.error || "Login failed");
        }
      } else {
        console.error("Non-JSON login response:", raw);
        alert("Unexpected server response. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleRegister = () => {
    Linking.openURL(
      "https://rockland-6cf4cyfj4-kenneths-projects-07a9aabf.vercel.app/"
    );
  };
  const handleForgotPassword = () => console.log("Navigate to forgot password");

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
              className="border border-gray-300 rounded-lg px-4 text-base text-gray-800 bg-gray-50"
              style={{ height: 48, paddingVertical: 10 }}
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
                className="flex-1 px-4 text-base text-gray-800"
                style={{ height: 48, paddingVertical: 10 }}
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
                {showPassword ? (
                  <VisibilityOn width={20} height={20} />
                ) : (
                  <VisibilityOff width={20} height={20} />
                )}
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
                className={`w-5 h-5 border-2 rounded border-gray-300 mr-2 items-center justify-center ${
                  rememberMe ? "bg-green-600 border-green-600" : ""
                }`}
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
            className="bg-green-600 py-4 rounded-lg mb-2"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold text-center">Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
