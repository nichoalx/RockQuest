"use client"
import React, { useState, useEffect } from "react"
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

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setUsername(data.username ?? "Username")
        setDescription(data.description ?? "")
        setBirthday(data.dob ? new Date(data.dob).toLocaleDateString() : "Birthday")
        setAvatarId(typeof data.avatarId === "number" ? data.avatarId : 1)
        setSelectedPfp(avatarFromId(data.avatarId))
      } catch (e: any) {
        console.log("getProfile error:", e?.response?.status, e?.response?.data, e?.message)
        if (e?.response?.status === 404) {
          Alert.alert("Complete Profile", "Let’s finish your profile first.", [
            {
              text: "OK",
              onPress: () =>
                router.replace({
                  pathname: "/(tabs)/players/edit-profile",
                  params: { role: "player" },
                }),
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

  const saveDescription = async () => {
    try {
      await updateProfile({ description: tempDescription })
      setDescription(tempDescription)
      setIsModalVisible(false)
    } catch {
      Alert.alert("Error", "Could not update description.")
    }
  }

  if (!fontsLoaded || loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.replace("/(tabs)/players/profile")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
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
              <Text style={styles.descriptionText}>
                {description || "Add a short description about yourself."}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Badges:</Text>
            <View style={styles.achievementsGrid}>
              {[1, 2, 3].map((item) => (
                <View key={item} style={styles.achievementBox}>
                  <View style={styles.achievementX}>
                    <View style={styles.xLine1} />
                    <View style={styles.xLine2} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tracker */}
          <View style={styles.trackerSection}>
            <Text style={styles.sectionTitle}>Tracker:</Text>
            <View style={styles.trackerStats}>
              <View style={styles.trackerItem}>
                <Text style={styles.trackerLabel}>Found</Text>
                <Text style={styles.trackerNumber}>0</Text>
              </View>
              <View style={styles.trackerDivider} />
              <View style={styles.trackerItem}>
                <Text style={styles.trackerLabel}>Total</Text>
                <Text style={styles.trackerNumber}>0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() =>
              router.replace({ pathname: "/(tabs)/players/edit-profile", params: { role: "player" } })
            }
          >
            <Ionicons name="create" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() =>
              router.replace({ pathname: "/(tabs)/players/collections", params: { tab: "Badges" } })
            }
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
                const errorMessage =
                  error instanceof Error && error.message
                    ? error.message
                    : "Failed to log out."
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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
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
    </View>
  )
}

// keep your styles here...


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#C0BAA9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  achievementsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  achievementsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  achievementBox: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  achievementX: {
    width: 24,
    height: 24,
    position: "relative",
  },
  xLine1: {
    position: "absolute",
    width: 24,
    height: 2,
    backgroundColor: "#6b7280",
    transform: [{ rotate: "45deg" }],
    top: 11,
  },
  xLine2: {
    position: "absolute",
    width: 24,
    height: 2,
    backgroundColor: "#6b7280",
    transform: [{ rotate: "-45deg" }],
    top: 11,
  },
  trackerSection: {
    marginBottom: 0,
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
    backgroundColor: "#f3f4f6",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#1f2937",
    marginLeft: 12,
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#6b7280",
  },

  // Modal styles
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
