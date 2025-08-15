"use client"

import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { useRouter } from "expo-router"

SplashScreen.preventAutoHideAsync()

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const { width, height } = useWindowDimensions()
  const router = useRouter()

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <LinearGradient
      colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
      style={[styles.container, { width, height }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>RockQuest</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/auth?mode=login")}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push("/choose-role")}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  backgroundDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  circle1: {
    width: 120,
    height: 120,
    top: "15%",
    right: "10%",
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: "25%",
    left: "15%",
  },
  circle3: {
    width: 60,
    height: 60,
    top: "60%",
    right: "25%",
  },
  content: { alignItems: "center", zIndex: 1 },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 28,
    color: "white",
    textAlign: "center",
    marginBottom: 64,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical:20,
    paddingHorizontal: 50,
    minWidth: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#A77B4E",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
})
