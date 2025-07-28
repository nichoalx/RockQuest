import React, { useEffect } from "react"
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
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Sign up as:</Text>
        <Text style={styles.subtitle}>Choose your role to start your adventure!</Text>

<<<<<<< HEAD
        <TouchableOpacity
          onPress={() => handleRoleSelect("user")}
          accessibilityRole="button"
          accessibilityLabel="Sign up as Player"
        >
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
        >
          <Image
            source={require("../../assets/images/geologist_button.png")}
            style={styles.imageButton}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
=======
      <TouchableOpacity
        onPress={() => handleRoleSelect("player")}
        accessibilityRole="button"
        accessibilityLabel="Sign up as Player"
      >
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
      >
        <Image
  source={require("../../assets/images/geologist_button.png")}
  style={styles.imageButton}
  resizeMode="contain"
/>
      </TouchableOpacity>
>>>>>>> de88dec9a745e7084822bef2761bec79312bd69f
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#bfa882",
  },
  contentWrapper: {
    width: 350, // increased width to match larger images
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 16, // keep text size unchanged
    color: "#000",
    marginBottom: 40,
  },
  subtitle: {
  fontFamily: "PressStart2P_400Regular",
  fontSize: 12,
  color: "#333",
  marginBottom: 24,
  opacity: 0.7,
  textAlign: "left",
},
  imageButton: {
    width: 350,  // increased image width
    height: 155, // increased image height proportionally
    marginVertical: 10,
  },

})


