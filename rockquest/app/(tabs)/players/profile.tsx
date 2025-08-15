"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  Image,
  Alert,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { FIREBASE_AUTH } from "@/utils/firebase"
import BottomNav from "@/components/BottomNav"
import { getProfile, updateProfile } from "@/utils/userApi"
import { avatarFromId, avatarImages } from "@/utils/avatar"
import { getScanStats } from "@/utils/playerApi"
import { getBadges, badgeImages } from "@/utils/badgesApi"
import { LinearGradient } from "expo-linear-gradient"

type Badge = {
  id: string
  name: string
  imageKey: keyof typeof badgeImages
  kind: "scan" | "post"
  threshold: number
  progress: number
  earned: boolean
}

SplashScreen.preventAutoHideAsync()

export default function ProfileScreen() {
  const router = useRouter()
  const [username, setUsername] = useState("Username")
  const [birthday, setBirthday] = useState("Birthday")
  const [description, setDescription] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPfpModalVisible, setIsPfpModalVisible] = useState(false)
  const [selectedPfp, setSelectedPfp] = useState(avatarFromId(1))
  const [loading, setLoading] = useState(true)
  const [avatarId, setAvatarId] = useState<number | null>(null)
  const maxLength = 150
  const [todayCount, setTodayCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [badges, setBadges] = useState<Badge[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)

  const loadBadges = async () => {
    try {
      setBadgesLoading(true)
      const res = await getBadges()
      setBadges(res?.badges ?? [])
    } catch (e) {
      console.log("badges load error:", e)
      Alert.alert("Error", "Failed to load badges.")
    } finally {
      setBadgesLoading(false)
    }
  }

  const saveDescription = async () => {
    try {
      await updateProfile({ description: tempDescription })
      setDescription(tempDescription)
      setIsModalVisible(false)
    } catch {
      Alert.alert("Error", "Could not update description.")
    }
  }

  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const profile = await getProfile()
        await loadBadges()
        if (!mounted) return

        setUsername(profile.username ?? "Username")
        setDescription(profile.description ?? "")
        setBirthday(profile.dob ? new Date(profile.dob).toLocaleDateString() : "Birthday")
        setAvatarId(typeof profile.avatarId === "number" ? profile.avatarId : 1)
        setSelectedPfp(avatarFromId(profile.avatarId))

        setTotalCount(Number(profile.scanCount ?? 0))

        try {
          const stats = await getScanStats()
          if (mounted && stats) {
            setTodayCount(Number(stats.day?.count ?? 0))
          }
        } catch (err) {
          console.log("getScanStats error:", err)
        }
      } catch (e: any) {
        console.log("getProfile error:", e?.response?.status, e?.response?.data, e?.message)
        if (e?.response?.status === 404) {
          Alert.alert("Complete Profile", "Let's finish your profile first.", [
            {
              text: "OK",
              onPress: () => router.replace({ pathname: "/(tabs)/edit-profile", params: { role: "player" } }),
            },
          ])
        } else if (e?.response?.status === 401) {
          Alert.alert("Auth Error", "Please sign in again.")
          router.replace("/(tabs)/auth" as any)
        } else {
          Alert.alert("Error", "Failed to load profile.")
        }
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

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Loading…</Text>
      </View>
    )
  }

  return (
    <LinearGradient colors={["#A77B4E", "#BA9B77", "#C0BAA9"]} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Decorative background elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {/* Profile */}
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={() => setIsPfpModalVisible(true)} style={styles.profilePicture}>
              <Image source={selectedPfp} style={styles.profilePictureImage} />
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.playerLabel}>Player</Text>
              <View style={styles.birthdayContainer}>
                <Ionicons name="gift" size={16} color="#A77B4E" />
                <Text style={styles.birthdayText}>{birthday}</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <TouchableOpacity
              onPress={() => {
                setTempDescription(description)
                setIsModalVisible(true)
              }}
            >
              <Text style={styles.descriptionText}>{description || "Add a short description about yourself."}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          <Text style={styles.sectionTitle}>Badges</Text>
          {badgesLoading ? (
            <Text style={{ color: "#6b7280" }}>Loading…</Text>
          ) : (
            <View style={styles.badgesRow}>
              {badges
                .filter((b) => b.earned)
                .slice(0, 3)
                .map((b) => (
                  <Image key={b.id} source={badgeImages[b.imageKey]} resizeMode="contain" style={styles.badgeThumb} />
                ))}
              {Array.from({ length: Math.max(0, 3 - badges.filter((b) => b.earned).length) }).map((_, i) => (
                <View key={`ph-${i}`} style={[styles.badgeThumb, styles.badgePlaceholder]} />
              ))}
            </View>
          )}
        </View>

        {/* Tracker */}
        <View style={styles.trackerContainer}>
          <Text style={styles.sectionTitle}>Tracker</Text>
          <View style={styles.trackerStats}>
            <View style={styles.trackerItem}>
              <Text style={styles.trackerLabel}>Found</Text>
              <Text style={styles.trackerNumber}>{todayCount}</Text>
            </View>
            <View style={styles.trackerDivider} />
            <View style={styles.trackerItem}>
              <Text style={styles.trackerLabel}>Total</Text>
              <Text style={styles.trackerNumber}>{totalCount}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace({ pathname: "/(tabs)/edit-profile", params: { role: "player" } })}
          >
            <Ionicons name="create" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace({ pathname: "/(tabs)/players/collections", params: { tab: "Badges" } })}
          >
            <Ionicons name="trophy" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Badges</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={async () => {
              try {
                await FIREBASE_AUTH.signOut()
                router.replace("/(tabs)/auth" as any)
              } catch (error) {
                const errorMessage = error instanceof Error && error.message ? error.message : "Failed to log out."
                Alert.alert("Logout Error", errorMessage)
              }
            }}
          >
            <Ionicons name="log-out" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          { label: "Home", route: "/(tabs)/players/dashboard", icon: { lib: "ion", name: "home" } },
          { label: "Scan", route: "/(tabs)/players/camera", icon: { lib: "ion", name: "camera" } },
          { label: "Collections", route: "/(tabs)/players/collections", icon: { lib: "mat", name: "collections" } },
          { label: "Posts", route: "/(tabs)/players/posts", icon: { lib: "ion", name: "chatbubbles" } },
        ]}
      />

      {/* Description Modal */}
      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={tempDescription}
              onChangeText={setTempDescription}
              multiline
              maxLength={maxLength}
              placeholder="Write something about yourself..."
            />
            <Text style={styles.charCount}>
              {tempDescription.length}/{maxLength}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveDescription}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Picture Modal */}
      <Modal animationType="slide" transparent={true} visible={isPfpModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
              {Object.entries(avatarImages).map(([id, img]) => (
                <TouchableOpacity
                  key={id}
                  onPress={async () => {
                    try {
                      await updateProfile({ avatarId: Number(id) })
                      setSelectedPfp(img)
                      setAvatarId(Number(id))
                      setIsPfpModalVisible(false)
                    } catch {
                      Alert.alert("Error", "Could not update profile picture.")
                    }
                  }}
                >
                  <Image source={img} style={styles.pfpOptionImage} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsPfpModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: 100,
    right: -30,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 300,
    left: -20,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    bottom: 200,
    right: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "white",
    marginBottom: 8,
    marginTop: 20,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  badgesContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  trackerContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profilePicture: {
    marginRight: 16,
  },
  profilePictureImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    borderWidth: 3,
    borderColor: "#A77B4E",
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  playerLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  birthdayContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  birthdayText: {
    fontSize: 14,
    color: "#A77B4E",
    marginLeft: 6,
  },
  descriptionSection: {
    marginBottom: 0,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  trackerStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  trackerItem: {
    alignItems: "center",
    flex: 1,
  },
  trackerLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  trackerNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  trackerDivider: {
    width: 2,
    height: 40,
    backgroundColor: "#1f2937",
    marginHorizontal: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
    fontWeight: "500",
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },
  badgeThumb: {
    width: 90,
    height: 70,
    borderRadius: 8,
  },
  badgePlaceholder: {
    backgroundColor: "#e5e7eb",
    opacity: 0.5,
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  descriptionInput: {
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "white",
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#A77B4E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  pfpOptionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A77B4E",
  },
})
