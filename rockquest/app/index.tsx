"use client"
import { View, Text, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { useRouter } from "expo-router";
import { InteractionManager } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function StartScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      InteractionManager.runAfterInteractions(() => {
        router.replace("/auth/auth");
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
        className="flex-1"
        style={{ width, height }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View className="flex-1 justify-center items-center px-5">
          <Text
            className="text-white text-center text-3xl"
            style={{
              fontFamily: "PressStart2P_400Regular",
              textShadowColor: "rgba(0, 0, 0, 0.5)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 4,
              letterSpacing: 2,
            }}
          >
            RockQuest
          </Text>
        </View>
      </LinearGradient>
    </View>
  )
}
