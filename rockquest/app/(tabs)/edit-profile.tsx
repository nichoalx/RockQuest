"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function EditProfilePage() {
  const router = useRouter()

  // Initialize birthday as Date object for date picker
  const [birthday, setBirthday] = useState(new Date("2000-01-11"))
  const [showDatePicker, setShowDatePicker] = useState(false)

  const [formData, setFormData] = useState({
    username: "Geologist01",
    email: "Geologist@gmail.com",
    password: "123456",
    birthday: "01/11/2000", // stored as string in MM/DD/YYYY format
  })
  const [showPassword, setShowPassword] = useState(false)

  const formatDate = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const openDatePicker = () => {
    setShowDatePicker(true)
  }

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios") // iOS keeps picker visible after selection
    if (selectedDate) {
      setBirthday(selectedDate)
      const formatted = formatDate(selectedDate)
      setFormData((prev) => ({ ...prev, birthday: formatted }))
    }
  }

  const handleSaveChanges = async () => {
    try {
      await AsyncStorage.setItem("userBirthday", formData.birthday)
      console.log("Birthday saved:", formData.birthday)
      router.replace("/(tabs)/GeoProfile")
    } catch (error) {
      console.error("Failed to save birthday", error)
    }
  }

  const handleDeleteAccount = () => {
    console.log("Delete account requested")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/GeoProfile")} style={styles.returnButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.returnText}>Return</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appName}>RockQuest</Text>
          <Text style={styles.pageTitle}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={32} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Edit profile</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(value) => handleInputChange("username", value)}
            placeholder="Enter username"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Birthday with calendar picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birthday</Text>
          <TouchableOpacity onPress={openDatePicker} style={[styles.input, { justifyContent: "center" }]}>
            <Text>{formData.birthday}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={birthday}
              mode="date"
              display="calendar"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/GeoHomepage")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/GeoPosts")}>
          <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
          <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/auth")}>
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  returnButton: { flexDirection: "row", alignItems: "center" },
  returnText: { fontSize: 16, color: "#333", marginLeft: 4 },
  headerCenter: { alignItems: "center" },
  appName: { fontSize: 20, fontWeight: "bold", color: "#333" },
  pageTitle: { fontSize: 16, color: "#666" },
  profileIcon: { width: 32 },
  content: { flex: 1, padding: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: "#333", marginBottom: 8, fontWeight: "500" },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: { paddingHorizontal: 16 },
  saveButton: {
    backgroundColor: "#A77B4E",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
  deleteButton: {
    backgroundColor: "transparent",
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#A77B4E",
  },
  deleteButtonText: {
    color: "#A77B4E",
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
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
  navTextActive: { color: "#A77B4E" },
})
