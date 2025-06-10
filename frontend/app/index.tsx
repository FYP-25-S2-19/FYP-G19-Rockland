import React from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // Handle login navigation
    router.push('/login');
  };

  const handleRegister = () => {
    // Handle register navigation
    console.log('Navigate to register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Main content - centered */}
        <View style={styles.centerContent}>
          {/* Rock image */}
          <Image
            source={{ uri: '/placeholder.svg?height=120&width=120' }}
            style={styles.rockImage}
            resizeMode="contain"
          />

          {/* Welcome text */}
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>ROCKLAND</Text>
          </View>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Login button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rockImage: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeText: {
    fontSize: 24,
    color: '#6b7280',
    marginBottom: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  bottomSection: {
    paddingBottom: 32,
  },
  loginButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
});