// app/subscribe-premium.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CrownIcon from "../assets/images/crown.svg";
import ArrowRightIcon from "../assets/images/arrow_right.svg";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SubscribePremiumScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`${API_URL}/api/subscription-plans`);
      const data = await res.json();
      const premiumPlan = data[0]; // assume one plan
      setPlan(premiumPlan);
    } catch (err) {
      Alert.alert("Error", "Failed to load subscription plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setSubmitting(true);
      const userId = await AsyncStorage.getItem("userId");

      const res = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          plan_id: plan.id,
        }),
      });

      const data = await res.json();

      if (data.url) {
        await WebBrowser.openBrowserAsync(data.url);
      } else {
        Alert.alert("Error", "Failed to start Stripe Checkout.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong during checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#EF9E1C" />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={["#91D29E", "#FFFFFF"]}
      start={{ x: -1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 bg-transparent">
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-green-800 mb-2">
              Go Premium 🚀
            </Text>
            <Text className="text-base text-center text-gray-600">
              {plan.description}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-5 mb-8" style={shadowStyle}>
            <View className="flex-row items-center mb-3">
              <CrownIcon width={24} height={24} />
              <Text className="ml-2 text-lg font-bold text-gray-800">
                Premium Features
              </Text>
            </View>
            {plan.features.map((feature: string, index: number) => (
              <Text key={index} className="text-base text-gray-600 mb-2">
                ✓ {feature}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={submitting}
            className="bg-[#EF9E1C] flex-row items-center justify-center py-4 rounded-2xl"
            activeOpacity={0.85}
            style={shadowStyle}
          >
            <Text className="text-white text-lg font-bold mr-2">
              {submitting
                ? "Processing..."
                : `Subscribe for $${plan.price.toFixed(2)} ${plan.currency.toUpperCase()}`}
            </Text>
            {!submitting && <ArrowRightIcon width={20} height={20} fill="white" />}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
