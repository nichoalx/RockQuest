"use client"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native"
import BottomNav from "@/components/BottomNav"

export default function NewPostScreen() {
  const router = useRouter()
  const { role = "geologist" } = useLocalSearchParams()

  const [image, setImage] = useState<string | null>(null)
  const [rockName, setRockName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [information, setInformation] = useState("")
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access media library is required!")
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = () => {
    router.replace(`/(tabs)/${role === "player" ? "players/posts" : "geologistsGeoPosts"}` as any)
  }

  const handleReturn = () => {
    router.replace(`/(tabs)/${role === "player" ? "players/posts" : "geologistsGeoPosts"}` as any)
  }

  const handleReset = () => {
    setRockName("")
    setShortDescription("")
    setInformation("")
    setImage(null)
  }

  const confirmLogout = () => {
    setIsLogoutModalVisible(false)
    router.replace("/(tabs)/auth" as any)
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>RockQuest</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() =>
              router.replace(`/(tabs)/${role === "player" ? "players/profile" : "geologists/GeoProfile"}`)
            }
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.pageTitle}>New Post</Text>

      <View style={styles.contentBox}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image" size={32} color="#A77B4E" />
              <Text style={styles.placeholderText}>Pick an Image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Rock Name</Text>
        <TextInput
          style={styles.input}
          value={rockName}
          onChangeText={setRockName}
          placeholder="Enter rock name"
        />

        <Text style={styles.label}>Short Description</Text>
        <TextInput
          style={styles.input}
          value={shortDescription}
          onChangeText={setShortDescription}
          placeholder="Enter a short description"
        />

        <Text style={styles.label}>Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={information}
          onChangeText={setInformation}
          placeholder="Enter detailed information"
          multiline
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
            <Text style={styles.returnButtonText}>Return</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Bar (Role-Based) */}
      {role === "player" ? (
      <BottomNav
        items={[
          {
            label: "Home",
            route: "/(tabs)/players/dashboard",
            icon: { lib: "ion", name: "home" },
          },
          {
            label: "Scan",
            route: "/(tabs)/players/camera",
            icon: { lib: "ion", name: "camera" },
          },
          {
            label: "Collections",
            route: "/(tabs)/players/collections",
            icon: { lib: "mat", name: "collections" },
          },
          {
            label: "Posts",
            route: "/(tabs)/players/posts",
            icon: { lib: "ion", name: "chatbubbles" },
          },
        ]}
      />
      ) : (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}>
            <Ionicons name="home" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
            <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
            <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setIsLogoutModalVisible(true)}>
            <Ionicons name="log-out" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn]}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmBtn]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Logout</Text>
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
  wrapper: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWrapper: {
    justifyContent: "center",
    height: 40,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 16,
    color: "#1f2937",
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
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  contentBox: {
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  imagePicker: {
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  placeholder: {
    height: 200,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  returnButton: {
    flex: 1,
    backgroundColor: "#777",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  returnButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#d1a054",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#A77B4E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
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
  navTextActive: {
    color: "#A77B4E",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
  },
  confirmBtn: {
    backgroundColor: "#A77B4E",
  },
  cancelText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
  },
})
