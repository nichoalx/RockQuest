import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { FIREBASE_AUTH, FIRESTORE } from "../../utils/firebase"


export default function ProfileInfoScreen() {
  const router = useRouter()
  const { email, password, type } = useLocalSearchParams()
  const [username, setUsername] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!email || !password || !type) {
      Alert.alert("Missing Info", "Please start from the beginning.")
      router.replace("/welcomeScreen")
    }
  }, [])

  const handleReturn = () => {
    router.replace("/welcomeScreen");
  };

  const handleNext = async () => {
    console.log({ email, password, username })

    if (!email || !password || !username) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      )
      const uid = getAuth().currentUser?.uid
      if (!uid) throw new Error("UID not available")

      await setDoc(doc(FIRESTORE, "user", uid), {
        uid,
        email,
        username,
        type: type, 
        description: description || "",
        createdAt: serverTimestamp(),
      })

      setLoading(false)

      // Redirect based on type
      if (type === "geologist") {
        router.replace("/GeoHomepage")
      } else if (type === "admin") {
        router.replace("/AdminDashboard")
      } else {
        router.replace("/(tabs)/dashboard")
      }
    } catch (error: any) {
      setLoading(false)
      Alert.alert("Error", error.message)
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
        <Text style={styles.buttonText}>{type === "geologist" ? "Next" : "Finish"}</Text>
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
