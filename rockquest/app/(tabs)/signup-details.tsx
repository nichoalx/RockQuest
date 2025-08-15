import { useRouter, useLocalSearchParams } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"

export default function SignupDetailsScreen() {
  const router = useRouter()
  const { type } = useLocalSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!type || (type !== "player" && type !== "geologist")) {
      Alert.alert("Error", "Invalid type selected")
      router.replace("/welcomeScreen")
    }
  }, [])

  const handleReturn = () => {
    router.replace("/welcomeScreen")
  }

  const handleNext = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (type === "geologist") {
      router.push({
        pathname: "/upload-documents",
        params: {
          email,
          password,
          type,
        },
      })
    } else {
      router.push({
        pathname: "/profile-info",
        params: {
          email,
          password,
          confirmPassword,
          type,
        },
      })
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.decorativeWave1} />
      <View style={styles.decorativeWave2} />

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome, aspiring {type === "player" ? "player" : "geologist"}!</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A77B4E"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#A77B4E"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#A77B4E"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
            <Text style={styles.returnButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C0BAA9", // Updated to light brown from color theme
    position: "relative",
  },
  decorativeWave1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#A77B4E", // Updated to darker brown
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    opacity: 0.8,
  },
  decorativeWave2: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: "#BA9B77", // Updated to medium brown
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    opacity: 0.6,
  },
  titleContainer: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "white", // White text for contrast on brown background
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Added text shadow for readability
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    justifyContent: "center",
    paddingHorizontal: 24, // Reduced padding to make box smaller
    paddingVertical: 32, // Reduced padding
    backgroundColor: "white",
    marginHorizontal: 32, // Increased margins to make box smaller
    marginTop: 250, // Positioned lower to accommodate title on background
    marginBottom: 120,
    borderRadius: 24,
    shadowColor: "#A77B4E", // Updated shadow color to brown theme
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  formContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#CCCABC", // Updated to lightest beige from theme
    borderColor: "#BA9B77", // Updated border to medium brown
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
    shadowColor: "#A77B4E", // Updated shadow color
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonContainer: {
    gap: 12,
  },
  nextButton: {
    backgroundColor: "#A77B4E", // Updated to darker brown
    padding: 18,
    borderRadius: 12,
    shadowColor: "#A77B4E", // Updated shadow color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  returnButton: {
    backgroundColor: "transparent",
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BA9B77", // Updated border to medium brown
  },
  returnButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#A77B4E", // Updated text color to darker brown
    textAlign: "center",
  },
})
