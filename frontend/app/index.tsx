import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    console.log('Navigate to register');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6">
        {/* Main content - centered */}
        <View className="flex-1 justify-center items-center">
          {/* Rock image */}
          <Image
            source={{ uri: '/placeholder.svg?height=120&width=120' }}
            className="w-30 h-30 mb-8"
            resizeMode="contain"
          />

          {/* Welcome text */}
          <View className="items-center mb-12">
            <Text className="text-2xl text-gray-500 mb-2">Welcome to</Text>
            <Text className="text-4xl font-bold text-green-600">ROCKLAND</Text>
          </View>
        </View>

        {/* Bottom section */}
        <View className="pb-8">
          {/* Login button */}
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-lg mb-4"
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text className="text-white text-lg font-semibold text-center">Log In</Text>
          </TouchableOpacity>

          {/* Register link */}
          <View className="flex-row justify-center items-center">
            <Text className="text-base text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text className="text-base text-green-600 font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
