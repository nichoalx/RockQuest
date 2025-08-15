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
  ScrollView,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { signOut } from "firebase/auth"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile, getAnnouncements } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

type PinnedAnnouncement = {
  id?: string
  title?: string
  description?: string
  imageUrl?: string
  pinned?: boolean
}

export default function Dashboard() {
  const router = useRouter()
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  // avatar
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))

  // announcement
  const [pinned, setPinned] = useState<PinnedAnnouncement | null>(null)

  useEffect(() => {
    let alive = true

    // Load profile (avatar)
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !alive) return
      try {
        const profile = await getProfile()
        if (!alive) return
        setAvatarSrc(avatarFromId(profile?.avatarId))
      } catch (e) {
        // non-fatal
        console.log("geologist dashboard getProfile error:", e)
      }
    })

    // Load announcements
    ;(async () => {
      try {
        const list = await getAnnouncements()
        if (!alive) return
        const pin = Array.isArray(list) ? list.find((a: any) => a?.pinned) : null
        setPinned(pin ? {
          id: pin.id, title: pin.title, description: pin.description, imageUrl: pin.imageUrl, pinned: true
        } : null)
      } catch (e) {
        console.log("geologist dashboard getAnnouncements error:", e)
        setPinned(null)
      }
    })()

    return () => { alive = false; unsub() }
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH)
    } catch {}
    setIsLogoutModalVisible(false)
    router.replace("/(tabs)/auth")
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={["#CCCABC", "#C0BAA9", "#BA9B77"]} style={styles.backgroundGradient}>
        {/* Decorative background circles */}
        <View style={[styles.decorativeCircle, { top: 100, right: -50 }]} />
        <View style={[styles.decorativeCircle, { bottom: 200, left: -30, opacity: 0.3 }]} />
        <View style={[styles.decorativeCircle, { top: 300, left: width * 0.7, opacity: 0.2 }]} />
      </LinearGradient>

      <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        {/* Header with Announcement & Profile */}
        <View style={styles.headerContainer}>
          <View style={styles.greetingWrapper}>
            <View style={styles.greetingBanner}>
              {pinned ? (
                <TouchableOpacity activeOpacity={0.9}>
                  <View style={styles.greetingTextBlock}>
                    <Text style={styles.greetingTitle}>
                      {pinned.title || "Announcement"}
                    </Text>
                    {!!pinned.description && (
                      <Text style={styles.greetingSubtitle} numberOfLines={2}>
                        {pinned.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.greetingTextBlock}>
                  <Text style={styles.greetingTitle}>Welcome back!</Text>
                  <Text style={styles.greetingSubtitle}>No pinned announcements right now.</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileIcon}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/geologists/GeoProfile")}
          >
            <Image source={avatarSrc} style={{ width: 38, height: 38, borderRadius: 19 }} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Ionicons name="document-text" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>12</Text>
            <Text style={styles.statsLabel}>Posts Reviewed</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="checkmark-circle" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>8</Text>
            <Text style={styles.statsLabel}>Approved</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="time" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>4</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcutContainer}>
          <TouchableOpacity style={styles.shortcutButton} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
            <View style={styles.shortcutContent}>
              <Ionicons name="chatbubbles" size={20} color="#A77B4E" />
              <View style={styles.shortcutTextContainer}>
                <Text style={styles.shortcutText}>View Posts</Text>
                <Text style={styles.shortcutSubtext}>Browse community posts</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BA9B77" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => router.replace("/(tabs)/geologists/GeoReviewPosts")}
          >
            <View style={styles.shortcutContent}>
              <Ionicons name="clipboard" size={20} color="#A77B4E" />
              <View style={styles.shortcutTextContainer}>
                <Text style={styles.shortcutText}>Review Posts</Text>
                <Text style={styles.shortcutSubtext}>Moderate submissions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BA9B77" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Activity (static placeholder) */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View className="activityItem" style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Approved post about igneous rocks</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="eye" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Reviewed sedimentary formation post</Text>
                <Text style={styles.activityTime}>5 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="chatbubble" size={16} color="white" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New post submitted for review</Text>
                <Text style={styles.activityTime}>1 day ago</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}
        >
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
        >
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
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleLogout}>
                <Text style={styles.saveButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// CSS Stylesheet (unchanged except profileIcon inner content now <Image/>)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCABC",
    position: "relative",
  },

  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorativeCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(167, 123, 78, 0.1)",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  contentWrapper: {
    flex: 1,
    paddingBottom: 100,
  },

  greetingWrapper: { flex: 1, marginRight: 12 },

  greetingBanner: {
    backgroundColor: "#A77B4E",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  greetingTextBlock: { flexDirection: "column" },
  greetingTitle: {
    color: "white",
    fontSize: 12,
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 6,
  },
  greetingSubtitle: { color: "white", fontSize: 12 },

  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A77B4E",
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },

  statsCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statsNumber: { fontSize: 20, fontWeight: "bold", color: "#A77B4E", marginTop: 8, marginBottom: 4 },
  statsLabel: { fontSize: 12, color: "#6b7280", textAlign: "center" },

  shortcutContainer: { marginTop: 24, paddingHorizontal: 16, gap: 12 },
  shortcutButton: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  shortcutContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  shortcutTextContainer: { flex: 1 },
  shortcutText: { color: "#1f2937", fontSize: 16, fontWeight: "600", marginBottom: 2 },
  shortcutSubtext: { color: "#6b7280", fontSize: 12 },

  activityContainer: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 12 },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: "#1f2937", marginBottom: 2 },
  activityTime: { fontSize: 12, color: "#6b7280" },

  bottomPadding: { height: 20 },

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
  navTextActive: { color: "#A77B4E" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
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
