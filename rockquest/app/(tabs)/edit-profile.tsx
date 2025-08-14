import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Modal,
} from "react-native"
import { getProfile, updateProfile, completeProfile } from "@/utils/userApi"
import { avatarImages } from "@/utils/avatar"
import { deleteAccount } from "@/utils/userApi"
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signOut } from "firebase/auth"

type FormState = {
  username: string
  email: string
  password: string 
  birthday: string 
  description: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const { role = "geologist" } = useLocalSearchParams()
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState<FormState>({
    username: role === "player" ? "Player01" : "Geologist01",
    email: role === "player" ? "Player@gmail.com" : "Geologist@gmail.com",
    password: "123456",
    birthday: "",
    description: "",
  })
  const [avatarId, setAvatarId] = useState<number>(1)
  const [isPfpModalVisible, setIsPfpModalVisible] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [birthdayError, setBirthdayError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileExists, setProfileExists] = useState<boolean>(false)

  // ------------ date helpers ------------
  const toDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  const ddmmyyyyToISO = (val: string) => {
    const [dd, mm, yyyy] = val.split("/").map(Number)
    return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
  }

  const parseDobFromApi = (dob: any): string => {
    try {
      if (!dob) return ""
      if (typeof dob === "object" && "_seconds" in dob) {
        const d = new Date(dob._seconds * 1000)
        return toDDMMYYYY(d)
      }
      const d = new Date(dob)
      if (!isNaN(d.getTime())) return toDDMMYYYY(d)
      return ""
    } catch {
      return ""
    }
  }

  // ------------ form helpers ------------
  const validateBirthday = (value: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false
    const [dd, mm, yyyy] = value.split("/").map(Number)
    const date = new Date(yyyy, mm - 1, dd)
    return date.getFullYear() === yyyy && date.getMonth() === mm - 1 && date.getDate() === dd
  }

  const formatBirthday = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    if (cleaned.length <= 2) return cleaned
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
  }

  const handleBirthdayChange = (text: string) => {
    const formatted = formatBirthday(text)
    setFormData((prev) => ({ ...prev, birthday: formatted }))

    if (formatted.length < 10) setBirthdayError("Please key in your birthday using the DD/MM/YYYY format!")
    else if (!validateBirthday(formatted)) setBirthdayError("Invalid birthday. Please use DD/MM/YYYY.")
    else setBirthdayError("")
  }

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDeleteAccount = () => {
  Alert.alert(
    "Delete Account",
    "Are you sure you want to delete your account? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: doDeleteAccount },
    ]
  )
}

  const doDeleteAccount = async () => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      Alert.alert("Not signed in", "Please sign in and try again.")
      return
    }

    setDeleting(true)
    try {
      // 1) Delete Firestore/DB side while we still have a valid JWT
      await deleteAccount()

      // 2) Try delete the Auth user
      try {
        await deleteUser(user)
      } catch (err: any) {
        // If recent login required, try email/password reauth (if we have it)
        if (err?.code === "auth/requires-recent-login") {
          const email = formData.email?.trim()
          const pass  = formData.password?.trim()

          if (email && pass && pass.length >= 6) {
            const cred = EmailAuthProvider.credential(email, pass)
            await reauthenticateWithCredential(user, cred)
            await deleteUser(user) // retry after reauth
          } else {
            setDeleting(false)
            Alert.alert(
              "Re-authentication required",
              "For security, please sign in again and re-try deleting your account."
            )
            return
          }
        } else {
          throw err
        }
      }

      // 3) Best-effort sign out + local cleanup
      try { await signOut(auth) } catch {}
      await AsyncStorage.multiRemove(["userName", "userBirthday"])

      Alert.alert("Account deleted", "Your account has been removed.")
      router.replace("/welcomeScreen" as any)
    } catch (e: any) {
      console.log("delete account error:", e?.code || e?.message, e)
      Alert.alert("Error", "Failed to delete account. Please try again.")
    } finally {
      setDeleting(false)
    }
  }
  // ------------ load profile on mount ------------
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getProfile()
        if (!mounted) return

        let birthdayFromApi = parseDobFromApi(data?.dob)
        if (!birthdayFromApi) {
          birthdayFromApi = (await AsyncStorage.getItem("userBirthday")) || ""
        }

        setProfileExists(true)
        setAvatarId(typeof data?.avatarId === "number" ? data.avatarId : 1)
        setFormData((prev) => ({
          ...prev,
          username: data?.username ?? prev.username,
          email: data?.email ?? prev.email,
          birthday: birthdayFromApi,
          password: prev.password,
          description: data?.description ?? "Rock enthusiast exploring the geological wonders of the world!",
        }))
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setProfileExists(false)
          const savedBirthday = await AsyncStorage.getItem("userBirthday")
          if (savedBirthday) {
            setFormData((prev) => ({ ...prev, birthday: savedBirthday }))
          }
        } else if (e?.response?.status === 401) {
          Alert.alert("Auth Error", "Please sign in again.")
          router.replace("/(tabs)/auth" as any)
        } else {
          console.log("getProfile error:", e?.message)
          Alert.alert("Error", "Failed to load profile.")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // ------------ avatar change (tap to open modal) ------------
  const changeAvatar = async (id: number) => {
    try {
      await updateProfile({ avatarId: id })
      setAvatarId(id)
      setIsPfpModalVisible(false)
    } catch {
      Alert.alert("Error", "Could not update profile picture.")
    }
  }

  // ------------ save ------------
  const handleSaveChanges = async () => {
    if (birthdayError) {
      Alert.alert("Invalid birthday", "Please fix the birthday format first.")
      return
    }

    setSaving(true)
    try {
      const payload: any = {
        username: formData.username,
        email: formData.email,
        description: formData.description,
      }

      if (formData.birthday && validateBirthday(formData.birthday)) {
        payload.dob = ddmmyyyyToISO(formData.birthday)
      }

      if (profileExists) {
        await updateProfile(payload)
      } else {
        await completeProfile({
          username: formData.username,
          type: role === "player" ? "player" : "geologist",
          description: formData.description,
          dob: payload.dob,       // can be undefined
          avatarId: avatarId || 1,
          emailAddress: formData.email,
        })
        setProfileExists(true)
      }

      await AsyncStorage.setItem("userName", formData.username)
      if (formData.birthday) await AsyncStorage.setItem("userBirthday", formData.birthday)

      Alert.alert("Success", "Changes saved!")
      if (role === "player") {
        router.replace("/(tabs)/players/profile")
      } else {
        router.replace("/(tabs)/geologists/GeoProfile")
      }
    } catch (err: any) {
      if (err?.response?.status === 400 && err?.response?.data?.detail?.includes("Username")) {
        Alert.alert("Username taken", "Please choose another username.")
      } else {
        console.log("save error:", err?.response?.status, err?.response?.data)
        Alert.alert("Error", "Failed to save changes.")
      }
    } finally {
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#A77B4E" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>Loading profile…</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F0" />

      {/* Header with explicit redirect back */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (role === "player") {
              router.replace("/(tabs)/players/profile")
            } else {
              router.replace("/(tabs)/geologists/GeoProfile")
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setIsPfpModalVisible(true)}
            activeOpacity={0.8}
          >
            <Image
              source={avatarImages[avatarId] || avatarImages[1]}
              style={styles.avatar}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Tap to change avatar</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="person-outline" size={16} color="#A77B4E" /> Username
            </Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              placeholder="Enter username"
              autoCapitalize="none"
            />
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="mail-outline" size={16} color="#A77B4E" /> Email
            </Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text-outline" size={16} color="#A77B4E" /> About Me
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => handleInputChange("description", value)}
              placeholder="Tell others about your rock hunting adventures..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={styles.characterCount}>{formData.description.length}/200</Text>
          </View>

          {/* Password (UI only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="lock-closed-outline" size={16} color="#A77B4E" /> Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.password}
                onChangeText={(value) => handleInputChange("password", value)}
                placeholder="Enter password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#A77B4E" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Note: Password changes are handled locally only</Text>
          </View>

          {/* Birthday */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="calendar-outline" size={16} color="#A77B4E" /> Birthday
            </Text>
            <TextInput
              style={[styles.input, birthdayError ? { borderColor: "#DC2626" } : {}]}
              value={formData.birthday}
              onChangeText={handleBirthdayChange}
              placeholder="DD/MM/YYYY"
              keyboardType="numeric"
              maxLength={10}
            />
            {birthdayError !== "" && (
              <Text style={styles.errorText}>
                <Ionicons name="alert-circle" size={14} color="#DC2626" /> {birthdayError}
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
            <Text style={styles.saveButtonText}>{saving ? "Saving Changes..." : "Save Changes"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.deleteButton, deleting && { opacity: 0.6 }]} onPress={handleDeleteAccount} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color="#DC2626" size="small" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#DC2626" />
            )}
            <Text style={styles.deleteButtonText}>{deleting ? "Deleting..." : "Delete Account"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Avatar Picker Modal */}
      <Modal animationType="slide" transparent={true} visible={isPfpModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
              {Object.entries(avatarImages).map(([id, img]) => (
                <TouchableOpacity key={id} onPress={() => changeAvatar(Number(id))}>
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  backButton: { paddingRight: 8, paddingVertical: 4 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937" },

  content: { flex: 1 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "white",
    marginBottom: 20,
  },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F0",
    borderWidth: 3,
    borderColor: "#A77B4E",
  },
  avatarLabel: { fontSize: 14, color: "#666", fontStyle: "italic" },

  formContainer: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 24 },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "600",
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#333",
  },
  textArea: { height: 100, paddingTop: 14 },
  characterCount: { fontSize: 12, color: "#666", textAlign: "right", marginTop: 4 },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  passwordInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: "#333" },
  eyeIcon: { paddingHorizontal: 16 },
  helperText: { fontSize: 12, color: "#666", marginTop: 6, fontStyle: "italic" },

  errorText: { fontSize: 14, color: "#DC2626", marginTop: 6, flexDirection: "row", alignItems: "center" },

  buttonContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  saveButton: {
    backgroundColor: "#A77B4E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#A77B4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "600", marginLeft: 8 },
  deleteButton: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#DC2626",
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteButtonText: { color: "#DC2626", fontSize: 16, fontWeight: "600", marginLeft: 8 },

  // Modal
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
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 12 },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical:10,
    borderRadius: 8,
    alignSelf: "center",
  },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
  pfpOptionImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#A77B4E",
  },
})
