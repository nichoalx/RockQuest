import { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  Animated,
} from "react-native";
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

  // Animated opacity value for flashing effect
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Flashing animation loop
  useEffect(() => {
    if (!tapped) {
      const flashing = Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      flashing.start();

      // Clean up animation on unmount or tap
      return () => flashing.stop();
    }
  }, [tapped, opacityAnim]);

  // Navigate on tap
  useEffect(() => {
    if (tapped) {
      router.replace("/(tabs)/welcomeScreen");
    }
  }, [tapped, router]);

  if (!fontsLoaded) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={() => setTapped(true)}
    >
      <View style={[styles.background, { width, height }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.animationContainer}>
            <LottieView
              source={require("../../assets/images/welcome-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
              resizeMode="contain"
            />
            <Animated.Text style={[styles.tap, { opacity: opacityAnim }]}>
              Tap to start
            </Animated.Text>
          </View>
        </SafeAreaView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    flex: 1,
    backgroundColor: "#bfa882",
  },
  safeArea: {
    flex: 1,
  },
  animationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  tap: {
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    fontFamily: "PressStart2P_400Regular",
    fontSize: 24,
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    zIndex: 10,
  },
});







