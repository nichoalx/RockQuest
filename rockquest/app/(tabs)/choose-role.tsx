import React from "react"
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native"
import { useRouter } from "expo-router"

export default function ChooseRoleScreen() {
  const router = useRouter()

  const handleRoleSelect = (type: "player" | "geologist") => {
    router.push({ pathname: "/signup-details", params: { type } })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up as:</Text>

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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
  },
  imageButton: {
    width: 300,      // 900 ÷ 3
    height: 133,     // 400 ÷ 3
    marginVertical: 10,
  },
})

