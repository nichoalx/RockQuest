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
  const [type, setType] = useState("user")
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

  const handleAuth = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    setLoading(true)
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const { uid } = userCredential.user

        // Get user type from Firestore
        const userDoc = await getDoc(doc(FIRESTORE, "user", uid))
        const userData = userDoc.data()
        const userType = userData?.type || "user"

        setLoading(false)

        // Redirect based on type
        if (userType === "geologist") {
          router.replace("/GeoHomepage")
        } else if (userType === "admin") {
          router.replace("/AdminDashboard")
        } else {
          router.replace("/(tabs)/dashboard")
        }
      })
      .catch((error) => {
        setLoading(false)
        Alert.alert("Authentication Error", error.message)
      })
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
                  <Text style={styles.label}>Login As</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    {["user", "geologist", "admin"].map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.roleButton, type === r && styles.roleButtonSelected]}
                        onPress={() => setType(r)}
                      >
                        <Text
                          style={type === r ? styles.roleButtonTextSelected : styles.roleButtonText}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
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

              <TouchableOpacity style={styles.authButton} onPress={handleAuth} activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.authButtonText}>{isLogin ? "Login" : "Create Account"}</Text>
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
  label: { color: "#374151", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  authButton: {
    backgroundColor: "#A77B4E",
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  authButtonText: { color: "white", textAlign: "center", fontSize: 16, fontWeight: "bold" },
  toggleText: { color: "#A77B4E", textAlign: "center", fontSize: 14 },
  roleButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A77B4E",
    backgroundColor: "white",
    alignItems: "center",
  },
  roleButtonSelected: { backgroundColor: "#A77B4E" },
  roleButtonText: { color: "#A77B4E", fontWeight: "bold" },
  roleButtonTextSelected: { color: "white", fontWeight: "bold" },
})
