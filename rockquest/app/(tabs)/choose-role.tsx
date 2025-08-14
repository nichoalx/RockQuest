import { useEffect } from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native"
import { useRouter } from "expo-router"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"

SplashScreen.preventAutoHideAsync()

export default function ChooseRoleScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const handleRoleSelect = (type: "player" | "geologist") => {
    router.push({ pathname: "/signup-details", params: { type } })
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundDecoration} />
      <View style={styles.backgroundDecoration2} />

      <View style={styles.contentWrapper}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Choose Your Path</Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subtitle}>Select your role to begin the adventure!</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleRoleSelect("player")}
            accessibilityRole="button"
            accessibilityLabel="Sign up as Player"
            style={styles.buttonWrapper}
          >
            <View style={styles.buttonShadow} />
            <Image
              source={require("../../assets/images/player_button.png")}
              style={styles.imageButton}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelect("geologist")}
            accessibilityRole="button"
            accessibilityLabel="Sign up as Geologist"
            style={styles.buttonWrapper}
          >
            <View style={styles.buttonShadow} />
            <Image
              source={require("../../assets/images/geologist_button.png")}
              style={styles.imageButton}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#BA9B77",
  },
  backgroundDecoration: {
    position: "absolute",
    top: 100,
    right: 50,
    width: 120,
    height: 120,
    backgroundColor: "#A77B4E",
    borderRadius: 60,
    opacity: 0.3,
  },
  backgroundDecoration2: {
    position: "absolute",
    bottom: 150,
    left: 30,
    width: 80,
    height: 80,
    backgroundColor: "#7a4a1aff",
    borderRadius: 40,
    opacity: 0.2,
  },
  contentWrapper: {
    width: 350,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 18,
    color: "#ffffffff",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "#0000004f",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  titleUnderline: {
    width: 200,
    height: 4,
    backgroundColor: "#e07a5f",
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 11,
    color: "#ffffffff",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 25,
    alignItems: "center",
  },
  buttonWrapper: {
    position: "relative",
  },
  buttonShadow: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 350,
    height: 155,
    backgroundColor: "#52311cea",
    borderRadius: 8,
    zIndex: -1,
  },
  imageButton: {
    width: 350,
    height: 155,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})
