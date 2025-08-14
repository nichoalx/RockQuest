"use client"
import { addFact } from "@/utils/geoApi"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"

export default function NewFactScreen() {
  const router = useRouter()
  const [factName, setFactName] = useState("")
  const [shortFactDescription, setShortFactDescription] = useState("")
  const [factInformation, setFactInformation] = useState("")
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    // validations
    if (!factName.trim()) {
      Alert.alert("Error", "Please enter a Fact Name")
      return
    }
    if (!shortFactDescription.trim() && !factInformation.trim()) {
      Alert.alert("Error", "Please enter at least a short description or information")
      return
    }

    try {
      setLoading(true)

      // Build description by combining short + info
      const combinedDescription = [shortFactDescription.trim(), factInformation.trim()]
        .filter(Boolean)
        .join("\n\n")

      // Generate a stable factId (backend requires it)
      // Use uid + timestamp to avoid collisions.
      const uid = FIREBASE_AUTH.currentUser?.uid ?? "anon"
      const factId = `${uid}-${Date.now()}`

      await addFact({
        factId,
        title: factName.trim(),
        description: combinedDescription,
      })

      Alert.alert("Success", "Fact added")
      router.replace("/(tabs)/geologists/GeoPosts")
    } catch (e) {
      console.log("addFact error:", e)
      Alert.alert("Error", "Failed to add fact")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFactName("")
    setShortFactDescription("")
    setFactInformation("")
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>RockQuest</Text>
          </View>
        </View>
      </View>

      <Text style={styles.pageTitle}>New Fact</Text>

      <View style={styles.contentBox}>
        <Text style={styles.label}>Fact Name</Text>
        <TextInput
          style={styles.input}
          value={factName}
          onChangeText={setFactName}
          placeholder="Enter Fact name"
        />

        <Text style={styles.label}>Short Description</Text>
        <TextInput
          style={styles.input}
          value={shortFactDescription}
          onChangeText={setShortFactDescription}
          placeholder="Enter a short description"
        />

        <Text style={styles.label}>Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={factInformation}
          onChangeText={setFactInformation}
          placeholder="Enter detailed information"
          multiline
        />

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
            disabled={loading}
          >
            <Text style={styles.returnButtonText}>Return</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={loading}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Fact</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}
          disabled={loading}
        >
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
          disabled={loading}
        >
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setIsLogoutModalVisible(true)}
          disabled={loading}
        >
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
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
                style={styles.logoutButton}
                onPress={() => {
                  setIsLogoutModalVisible(false)
                  router.replace("/(tabs)/auth")
                }}
              >
                <Text style={styles.logoutButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// STYLES (unchanged)
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  logoutButton: {
    flex: 1,
    backgroundColor: "#A77B4E",
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "600",
  },
})
