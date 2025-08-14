"use client"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useCallback, useState } from "react"
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { getProfile, updateProfile } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"

export default function GeoProfile() {
  const router = useRouter()

  const [username, setUsername] = useState("Username")
  const [birthday, setBirthday] = useState("")
  const [description, setDescription] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const maxLength = 150

  const [avatarSrc, setAvatarSrc] = useState<any>(avatarFromId(1))

  // --- helpers ---
  const toDisplayDate = (dob: any): string => {
    try {
      if (!dob) return ""
      // Firestore Timestamp { _seconds, _nanoseconds } or { seconds }
      if (typeof dob === "object") {
        const secs = (dob as any)._seconds ?? (dob as any).seconds
        if (typeof secs === "number") {
          return new Date(secs * 1000).toLocaleDateString()
        }
      }
      const d = new Date(dob)
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString()
    } catch {
      return ""
    }
  }

  useFocusEffect(
    useCallback(() => {
      let alive = true
      ;(async () => {
        try {
          const p = await getProfile()
          if (!alive) return
          setUsername(p?.username ?? "Username")
          setDescription(p?.description ?? "")
          setBirthday(toDisplayDate(p?.dob) || "")
          setAvatarSrc(avatarFromId(p?.avatarId))
        } catch (e: any) {
          // If not found, push them to edit profile to complete setup
          if (e?.response?.status === 404) {
            Alert.alert("Complete Profile", "Let’s finish your profile first.", [
              {
                text: "OK",
                onPress: () => router.replace({ pathname: "/(tabs)/edit-profile", params: { role: "geologist" } }),
              },
            ])
          } else if (e?.response?.status === 401) {
            Alert.alert("Auth Error", "Please sign in again.")
            router.replace("/(tabs)/auth" as any)
          } else {
            console.log("getProfile error:", e?.response?.status, e?.response?.data, e?.message)
            Alert.alert("Error", "Failed to load profile.")
          }
        }
      })()
      return () => {
        alive = false
      }
    }, [router]),
  )

  const saveDescription = async () => {
    try {
      await updateProfile({ description: tempDescription })
      setDescription(tempDescription)
      setIsModalVisible(false)
    } catch {
      Alert.alert("Error", "Failed to save description.")
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.backgroundGradient}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Profile</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              <Image source={avatarSrc} style={styles.profilePictureImage} />
              <View style={styles.profilePictureBorder} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.playerLabel}>🔬 Geologist</Text>
              </View>
              <View style={styles.birthdayContainer}>
                <Ionicons name="gift" size={16} color="#A77B4E" />
                <Text style={styles.birthdayText}>{birthday || "Birthday"}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>About Me</Text>
            <TouchableOpacity
              onPress={() => {
                setTempDescription(description)
                setIsModalVisible(true)
              }}
              activeOpacity={0.8}
              style={styles.descriptionContainer}
            >
              <Text style={styles.descriptionText}>{description || "Add a short description about yourself."}</Text>
              <Ionicons name="create-outline" size={16} color="#A77B4E" style={styles.editIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace({ pathname: "/(tabs)/edit-profile", params: { role: "geologist" } })}
          >
            <View style={styles.actionButtonIcon}>
              <Ionicons name="create" size={20} color="white" />
            </View>
            <Text style={styles.actionButtonText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#A77B4E" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="home" size={24} color="#BA9B77" />
          </View>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
        >
          <View style={styles.navIconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          </View>
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Editing Description */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CCCABC" },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#CCCABC",
  },
  decorativeCircle1: {
    position: "absolute",
    top: 100,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#C0BAA9",
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: "absolute",
    top: 300,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#BA9B77",
    opacity: 0.2,
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: 200,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#A77B4E",
    opacity: 0.15,
  },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 20,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileSection: { flexDirection: "row", marginBottom: 20 },
  profilePicture: {
    marginRight: 16,
    position: "relative",
  },
  profilePictureImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
  },
  profilePictureBorder: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "#A77B4E",
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 6,
  },
  roleContainer: {
    backgroundColor: "#A77B4E",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  playerLabel: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  birthdayContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  birthdayText: { fontSize: 14, color: "#A77B4E", marginLeft: 6, fontWeight: "500" },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
    paddingTop: 16,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  descriptionText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    flex: 1,
  },
  editIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
  actionButtons: { marginBottom: 20 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonIcon: {
    backgroundColor: "#A77B4E",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "600",
    flex: 1,
  },
  statsContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navIconContainer: {
    backgroundColor: "#f8f9fa",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 6,
    color: "#6b7280",
    fontWeight: "500",
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
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  descriptionInput: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 22,
    borderWidth: 2,
    borderColor: "#C0BAA9",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f8f9fa",
    minHeight: 100,
    textAlignVertical: "top",
    fontFamily: "System",
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 8,
    fontSize: 12,
    color: "#A77B4E",
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#A77B4E",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#A77B4E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f1f3f4",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
})
