import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"  // <-- Import Lottie

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
      <View style={styles.content}>
        {/*<LottieView
          source={require("../../../assets/images/welcome-animation.json")}
          autoPlay
          loop={false}
          style={{ width: 250, height: 250, marginBottom: 24 }}
        /> */}

        <Text style={styles.title}>RockQuest</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/auth?mode=login")}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/choose-role")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  content: { alignItems: "center" },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 28,
    color: "white",
    textAlign: "center",
    marginBottom: 48,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: "100%",
  },
  buttonText: {
    color: "#A77B4E",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
})

