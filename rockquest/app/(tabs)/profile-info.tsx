import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"

export default function ProfileInfoScreen() {
  const router = useRouter()
  const { email, password, role } = useLocalSearchParams()
  const [username, setUsername] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!email || !password || !role) {
      Alert.alert("Missing Info", "Please start from the beginning.")
      router.replace("/welcomeScreen")
    }
  }, [])

  const handleReturn = () => {
    router.replace("/welcomeScreen");
  };

  const handleNext = () => {
    if (!username || !description) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (role === "geologist") {
      router.push({
        pathname: "/upload-documents",
        params: { email, password, role, username, description },
      })
    } else {
      // Simulate account creation, then go to dashboard
      Alert.alert("Welcome!", "Account created successfully")
      router.replace("/(tabs)/dashboard")
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Info</Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>{role === "geologist" ? "Next" : "Finish"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
                    <Text style={styles.returnButtonText}>Return</Text>
                  </TouchableOpacity>
    </View>
  )
}

// CSS Stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
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
