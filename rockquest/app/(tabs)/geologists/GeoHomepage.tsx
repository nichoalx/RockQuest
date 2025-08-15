"use client"
import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { 
  Dimensions, 
  StatusBar, 
  StyleSheet,
  Text, 
  TouchableOpacity, 
  View, 
  Modal, 
  Image 
} from "react-native"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function Dashboard() {
  const router = useRouter()
  const [username, setUsername] = useState("Username")
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)

  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [loading, setLoading] = useState(true)

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  // Fetch profile & avatar
  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setUsername(data?.username || "Username")
        setAvatarSrc(avatarFromId(data?.avatarId))
      } catch (e) {
        console.log("getProfile error:", e)
      } finally {
        setLoading(false)
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  useEffect(() => {
    if (fontsLoaded && !loading) SplashScreen.hideAsync()
  }, [fontsLoaded, loading])

  if (!fontsLoaded || loading) return null

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.contentWrapper}>
        {/* Header with Greeting & Profile */}
        <View style={styles.headerContainer}>
          <View style={styles.greetingWrapper}>
            <View style={styles.greetingBanner}>
              <View style={styles.greetingTextBlock}>
                <Text style={styles.greetingTitle}>Hello, Geologist {username}!</Text>
                <Text style={styles.greetingSubtitle}>
                  Are you updated with the{" "}
                  <Text
                    style={styles.greetingLink}
                    onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
                  >
                    news?
                  </Text>
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileIcon}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/geologists/GeoProfile")}
          >
            <Image source={avatarSrc} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>

        <View style={styles.shortcutContainer}>
          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
          >
            <Text style={styles.shortcutText}>View Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => router.replace("/(tabs)/geologists/GeoReviewPosts")}
          >
            <Text style={styles.shortcutText}>Review Posts</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => setIsLogoutModalVisible(true)}>
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Logout Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setIsLogoutModalVisible(false)
                  router.replace("/(tabs)/auth")
                }}
              >
                <Text style={styles.saveButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// CSS Stylesheet
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6", position: "relative" },
  headerContainer: { flexDirection: "row", alignItems: "flex-start", paddingTop: 80, paddingHorizontal: 16 },
  contentWrapper: { flex: 1, paddingBottom: 100 },
  greetingWrapper: { flex: 1, marginRight: 12 },
  greetingBanner: {
    backgroundColor: "#A77B4E",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  greetingTextBlock: { flexDirection: "column" },
  greetingTitle: { color: "white", fontSize: 12, fontFamily: "PressStart2P_400Regular", marginBottom: 4 },
  greetingSubtitle: { color: "white", fontSize: 12 },
  greetingLink: { textDecorationLine: "underline", fontWeight: "bold" },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#A77B4E",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  shortcutContainer: { marginTop: 40, paddingHorizontal: 24, gap: 12 },
  shortcutButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  shortcutText: { color: "#6b7280", fontSize: 14, fontWeight: "500" },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  saveButton: { backgroundColor: "#A77B4E", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: { backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
})
