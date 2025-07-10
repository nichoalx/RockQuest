import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function StartScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [tapped, setTapped] = useState(false);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;
  if (tapped) {
    router.replace("/(tabs)/welcomeScreen");
    return null;
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.container} onPress={() => setTapped(true)}>
      <LinearGradient
        colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
        style={[styles.gradient, { width, height }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <Text style={styles.title}>RockQuest</Text>
          <Text style={styles.tap}>Tap to start</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 28,
    color: "white",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  tap: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 12,
    color: "white",
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
