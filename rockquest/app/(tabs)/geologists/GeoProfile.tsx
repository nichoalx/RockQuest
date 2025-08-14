"use client"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useCallback, useState } from "react"
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"

export default function GeoProfile() {
  const router = useRouter()
  const [username, setUsername] = useState("Username")
  const [birthday, setBirthday] = useState("")
  const [description, setDescription] = useState("")
  const [tempDescription, setTempDescription] = useState("")
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const maxLength = 150

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const savedUsername = await AsyncStorage.getItem("userName")
          const savedBirthday = await AsyncStorage.getItem("userBirthday")
          const savedDescription = await AsyncStorage.getItem("userDescription")

          if (savedUsername) setUsername(savedUsername)
          if (savedBirthday) setBirthday(savedBirthday)
          if (savedDescription) setDescription(savedDescription)
        } catch (error) {
          console.error("Failed to load profile data", error)
        }
      }
      loadProfile()
    }, [])
  )

  const saveDescription = async () => {
    try {
      await AsyncStorage.setItem("userDescription", tempDescription)
      setDescription(tempDescription)
      setIsModalVisible(false)
    } catch (error) {
      console.error("Failed to save description", error)
    }
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
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              <View style={styles.profilePicturePlaceholder} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.playerLabel}>Geologist</Text>
              <View style={styles.birthdayContainer}>
                <Ionicons name="gift" size={16} color="#A77B4E" />
                <Text style={styles.birthdayText}>{birthday || "Birthday"}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <TouchableOpacity
              onPress={() => {
                setTempDescription(description)
                setIsModalVisible(true)
              }}
            >
              <Text style={styles.descriptionText}>
                {description || "Add a short description about yourself.\nSet a character limit to the text field."}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace({ pathname: "/(tabs)/edit-profile", params: { role: "geologist" } })}
          >
            <Ionicons name="create" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => setIsLogoutModalVisible(true)}
          >
            <Ionicons name="log-out" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
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

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => setIsLogoutModalVisible(true)}
        >
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Logout</Text>
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
            <Text style={styles.charCount}>{tempDescription.length}/{maxLength}</Text>
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
  container: { flex: 1, backgroundColor: "white" },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
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
  content: { flex: 1, paddingHorizontal: 20 },
  profileCard: {
    backgroundColor: "#C0BAA9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileSection: { flexDirection: "row", marginBottom: 16 },
  profilePicture: { marginRight: 16 },
  profilePicturePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  playerLabel: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  birthdayContainer: { flexDirection: "row", alignItems: "center" },
  birthdayText: { fontSize: 14, color: "#A77B4E", marginLeft: 6 },
  descriptionSection: { marginBottom: 20 },
  descriptionText: { fontSize: 14, color: "#6b7280", lineHeight: 20 },
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
  actionButtons: { gap: 12, marginBottom: 20 },
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
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
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
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
})



