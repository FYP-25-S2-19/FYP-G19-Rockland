import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (email === "test@rockland.com" && password === "rock123") {
      // Navigate to home (either /home or /)
      router.replace("/home"); // or router.replace('/') if home screen is index.tsx
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Login Form Card */}
        <View style={styles.formCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me and Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: "/placeholder.svg?height=20&width=20" }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#16a34a", // Green background
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  registerLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerLink: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeText: {
    fontSize: 18,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  forgotPasswordLink: {
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6b7280",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 16,
    borderRadius: 8,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
});
