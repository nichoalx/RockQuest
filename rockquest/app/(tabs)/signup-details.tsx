import { useRouter, useLocalSearchParams } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"

export default function SignupDetailsScreen() {
  const router = useRouter()
  const { role } = useLocalSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (!role || (role !== "user" && role !== "geologist")) {
      Alert.alert("Error", "Invalid role selected")
      router.replace("/welcomeScreen") // Fallback in case user accessed this screen directly
    }
  }, [])

  const handleReturn = () => {
    router.replace("/welcomeScreen");
  };

  const handleNext = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    router.push({
      pathname: "/profile-info",
      params: {
        email,
        password,
        role,
      },
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up ({role === "user" ? "Player" : "Geologist"})</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#555"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#555"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#555"
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
              <Text style={styles.returnButtonText}>Return</Text>
            </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  input: {
    backgroundColor: "#ffffffff",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#A77B4E",
    padding: 16,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },

  returnButton: {
    backgroundColor: "#ccc",
    padding: 16,
    borderRadius: 8,
  },
  returnButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
})
