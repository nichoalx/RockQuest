import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

SplashScreen.preventAutoHideAsync();

export default function StartScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Navigate on tap
  useEffect(() => {
    if (tapped) {
      router.replace("/(tabs)/welcomeScreen");
    }
  }, [tapped, router]);

  if (!fontsLoaded) return null;

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={() => setTapped(true)}>
      <LinearGradient
        colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
        style={[styles.gradient, { width, height }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LottieView
          source={require("../../assets/images/welcome-animation.json")}
          autoPlay
          loop={false}
          style={{ width: width * 0.8, height: width * 0.8 }}
        />
        <Text style={styles.tap}>Tap to start</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tap: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 14,
    color: "white",
    marginTop: 24,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

