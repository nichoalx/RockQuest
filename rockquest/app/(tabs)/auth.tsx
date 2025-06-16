"use client"
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { useRouter } from "expo-router";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter();
  
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    // Simulated success — redirect
    Alert.alert("Success", isLogin ? "Logged in!" : "Account created!");
    router.replace("/(tabs)/dashboard");
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Confirm Password Input (only for signup) */}
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            {/* Auth Button */}
            <TouchableOpacity style={styles.authButton} onPress={handleAuth} activeOpacity={0.8}>
              <Text style={styles.authButtonText}>{isLogin ? "Login" : "Create Account"}</Text>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <TouchableOpacity onPress={toggleAuthMode} activeOpacity={0.7}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Start */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              /* Navigate back to start screen */
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>Back to Start</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 48,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  authButton: {
    backgroundColor: "#A77B4E",
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  authButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleText: {
    color: "#A77B4E",
    textAlign: "center",
    fontSize: 14,
  },
  backButton: {
    marginTop: 32,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
})
