"use client"
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match")
      return
    }

    // Here you would implement your actual authentication logic
    Alert.alert("Success", isLogin ? "Logged in successfully!" : "Account created successfully!")
  }

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
    <View className="flex-1">
      <LinearGradient
        colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-1 justify-center px-8">
          {/* Title */}
          <Text
            className="text-white text-center text-2xl mb-12"
            style={{
              fontFamily: "PressStart2P_400Regular",
              textShadowColor: "rgba(0, 0, 0, 0.5)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
              letterSpacing: 1,
            }}
          >
            {isLogin ? "Login" : "Sign Up"}
          </Text>

          {/* Form Container */}
          <View className="bg-white/90 rounded-lg p-6 shadow-lg">
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-gray-700 text-sm font-semibold mb-2">Password</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
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
              <View className="mb-6">
                <Text className="text-gray-700 text-sm font-semibold mb-2">Confirm Password</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base bg-white"
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
            <TouchableOpacity
              className="rounded-lg py-4 mb-4"
              style={{ backgroundColor: "#A77B4E" }}
              onPress={handleAuth}
              activeOpacity={0.8}
            >
              <Text className="text-white text-center text-base font-bold">{isLogin ? "Login" : "Create Account"}</Text>
            </TouchableOpacity>

            {/* Toggle Auth Mode */}
            <TouchableOpacity onPress={toggleAuthMode} activeOpacity={0.7}>
              <Text className="text-center text-sm" style={{ color: "#A77B4E" }}>
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Start */}
          <TouchableOpacity
            className="mt-8 py-3"
            onPress={() => {
              /* Navigate back to start screen */
            }}
            activeOpacity={0.7}
          >
            <Text className="text-white text-center text-sm underline">Back to Start</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}
