import { useLocalSearchParams, useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native"
import { createUserWithEmailAndPassword, getAuth, deleteUser, signOut } from "firebase/auth" // 👈 add deleteUser, signOut
import { FIREBASE_AUTH } from "../../utils/firebase"
import { LinearGradient } from "expo-linear-gradient"
import { completeProfile } from "../../utils/userApi"

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

  const handleReturn = () => router.replace("/welcomeScreen")

  const handleNext = async () => {
    const emailStr = Array.isArray(email) ? email[0] : (email as string)
    const passStr  = Array.isArray(password) ? password[0] : (password as string)
    const typeStr  = Array.isArray(type) ? type[0] : (type as string)
    const uname    = username.trim()

    if (!emailStr || !passStr || !uname) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      // 1) Create Auth user
      const cred = await createUserWithEmailAndPassword(FIREBASE_AUTH, emailStr, passStr)
      const user = cred.user
      if (!user) throw new Error("UID not available")

      try {
        // 2) Finalize profile on backend (enforces username uniqueness)
        await completeProfile({
          username: uname,
          type: typeStr,
          description: description || "",
          emailAddress: emailStr,
        })
      } catch (e: any) {
        // --- ROLLBACK: delete the just-created Auth user so email can be reused
        try {
          await deleteUser(user) // recent sign-in => permitted
        } catch (delErr) {
          // last resort: sign out to avoid being stuck logged-in
          try { await signOut(FIREBASE_AUTH) } catch {}
        }
        throw e
      }

      setLoading(false)
      router.replace(typeStr === "geologist" ? "/geologists/GeoHomepage" : "/(tabs)/players/dashboard")
    } catch (error: any) {
      setLoading(false)
      const detail = error?.response?.data?.detail
      const msg =
        detail === "Username is already taken"
          ? "That username is taken. Please choose another."
          : (error?.code === "auth/email-already-in-use"
              ? "This email is already registered."
              : detail || error.message || "Something went wrong")
      Alert.alert("Error", msg)
    }
  }

  return (
    <LinearGradient colors={["#A77B4E", "#BA9B77", "#C0BAA9"]} style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <Text style={styles.welcomeText}>Complete Your Profile</Text>

      <View style={styles.contentContainer}>
        <TextInput
          placeholder="Username"
          placeholderTextColor="#999"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          placeholder="Tell us about yourself..."
          placeholderTextColor="#999"
          style={[styles.input, styles.descriptionInput]}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>{(Array.isArray(type) ? type[0] : type) === "geologist" ? "Next" : "Finish"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
          <Text style={styles.returnButtonText}>Return</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, position: "relative" },
  decorativeCircle1: { position: "absolute", top: 100, right: 30, width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(204, 202, 188, 0.3)" },
  decorativeCircle2: { position: "absolute", top: 200, left: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(192, 186, 169, 0.4)" },
  decorativeCircle3: { position: "absolute", bottom: 150, right: 50, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(186, 155, 119, 0.2)" },
  welcomeText: { fontSize: 28, fontWeight: "bold", color: "white", textAlign: "center", marginBottom: 40, textShadowColor: "rgba(0, 0, 0, 0.3)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  contentContainer: { backgroundColor: "white", borderRadius: 20, padding: 30, width: "100%", maxWidth: 350, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  input: { backgroundColor: "#f8f8f8", borderColor: "#e0e0e0", borderWidth: 1, padding: 16, borderRadius: 12, marginBottom: 20, fontSize: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  descriptionInput: { height: 100, paddingTop: 16 },
  button: { backgroundColor: "#A77B4E", padding: 18, borderRadius: 12, marginBottom: 15, shadowColor: "#A77B4E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  returnButton: { backgroundColor: "#C0BAA9", padding: 18, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  returnButtonText: { color: "#A77B4E", fontWeight: "bold", textAlign: "center", fontSize: 16 },
})
