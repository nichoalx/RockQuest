import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { useRouter, useLocalSearchParams } from "expo-router"
import { FIREBASE_AUTH, FIRESTORE } from "../../utils/firebase"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function AuthScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [type, setType] = useState("player") // Changed from "user" to "player"
  const [loading, setLoading] = useState(false)

  const auth = FIREBASE_AUTH
  const router = useRouter()
  const { mode } = useLocalSearchParams()

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    setIsLogin(mode !== "signup")
  }, [mode])

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    try {
      setLoading(true)

      let userCredential
      if (isLogin) {
        // Login existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } else {
        // Create new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create user document in Firestore for new users
        await setDoc(doc(FIRESTORE, "user", userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          type: type, // Use the selected type from the form
          createdAt: serverTimestamp(),
          isActive: true,
        })
      }

      const { uid } = userCredential.user

      // Get user type from Firestore
      const userDoc = await getDoc(doc(FIRESTORE, "user", uid))
      
      if (!userDoc.exists()) {
        throw new Error("User profile not found. Please contact support.")
      }

      const userData = userDoc.data()
      const userType = userData?.type

      console.log("User type from Firestore:", userType) // Debug log

      setLoading(false)

      // Redirect based on type with proper mapping
      switch (userType) {
        case "geologist":
          router.replace("/(tabs)/geologists/GeoHomepage")
          break
        case "player":
        default:
          router.replace("/(tabs)/players/dashboard")
          break
      }

    } catch (error: any) {
      setLoading(false)
      console.error("Auth error:", error)
      
      let errorMessage = "Authentication failed"
      
      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email"
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password"
          break
        case "auth/email-already-in-use":
          errorMessage = "An account already exists with this email"
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters"
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address"
          break
        default:
          errorMessage = error.message || "Authentication failed"
      }
      
      Alert.alert("Authentication Error", errorMessage)
    }
  }

  const toggleAuthMode = () => {
    if (isLogin) {
      router.push("/choose-role")
    } else {
      setIsLogin(true)
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    }
  }

  if (!fontsLoaded) return null

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#A77B4E", "#BA9B77", "#C0BAA9"]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>

            <View style={styles.formContainer}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Account Type</Text>
                  <View style={styles.roleContainer}>
                    {[
                      { value: "player", label: "Player" },
                      { value: "geologist", label: "Geologist" },
                      { value: "admin", label: "Admin" }
                    ].map((role) => (
                      <TouchableOpacity
                        key={role.value}
                        style={[styles.roleButton, type === role.value && styles.roleButtonSelected]}
                        onPress={() => setType(role.value)}
                      >
                        <Text
                          style={type === role.value ? styles.roleButtonTextSelected : styles.roleButtonText}
                        >
                          {role.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.authButton, loading && styles.authButtonDisabled]} 
                onPress={handleAuth} 
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.authButtonText}>
                    {isLogin ? "Login" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleAuthMode} activeOpacity={0.7}>
                <Text style={styles.toggleText}>
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 32 },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 48,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  roleContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    gap: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    alignItems: "center",
  },
  roleButtonSelected: {
    backgroundColor: "#A77B4E",
    borderColor: "#A77B4E",
  },
  roleButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  roleButtonTextSelected: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  authButton: {
    backgroundColor: "#A77B4E",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
})