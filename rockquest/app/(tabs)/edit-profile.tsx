"use client"

import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"

export default function EditProfilePage() {
  const router = useRouter()
  const { role = "geologist" } = useLocalSearchParams()

  const [formData, setFormData] = useState({
    username: role === "player" ? "Player01" : "Geologist01",
    email: role === "player" ? "Player@gmail.com" : "Geologist@gmail.com",
    password: "123456",
    birthday: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [birthdayError, setBirthdayError] = useState("")

  useEffect(() => {
    const loadBirthday = async () => {
      try {
        const savedBirthday = await AsyncStorage.getItem("userBirthday")
        if (savedBirthday) {
          setFormData((prev) => ({ ...prev, birthday: savedBirthday }))
        }
      } catch (error) {
        console.error("Failed to load birthday", error)
      }
    }
    loadBirthday()
  }, [])

  const validateBirthday = (value: string) => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false

    const [dd, mm, yyyy] = value.split("/").map(Number)
    const date = new Date(yyyy, mm - 1, dd)

    return (
      date.getFullYear() === yyyy &&
      date.getMonth() === mm - 1 &&
      date.getDate() === dd
    )
  }

  const formatBirthday = (text: string) => {
    const cleaned = text.replace(/\D/g, "")
    let formatted = ""

    if (cleaned.length <= 2) {
      formatted = cleaned
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
    } else {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`
    }

    return formatted
  }

  const handleBirthdayChange = (text: string) => {
    const formatted = formatBirthday(text)
    setFormData((prev) => ({ ...prev, birthday: formatted }))

    if (formatted.length < 10) {
      setBirthdayError("Please key in your birthday using the DD/MM/YYYY format!")
    } else if (!validateBirthday(formatted)) {
      setBirthdayError("Invalid birthday. Please use DD/MM/YYYY.")
    } else {
      setBirthdayError("")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveChanges = async () => {
    try {
      await AsyncStorage.setItem("userName", formData.username)
      await AsyncStorage.setItem("userBirthday", formData.birthday)
      // You can save other data here too
      alert("Changes saved!")
    } catch (error) {
      console.error("Failed to save profile data", error)
    }
  }

  const handleDeleteAccount = () => {
    console.log("Delete account requested")
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (role === "player") {
              router.replace("/(tabs)/profile")
            } else {
              router.replace("/(tabs)/GeoProfile")
            }
          }}
          style={styles.returnButton}
        >
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

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Edit profile</Text>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(value) => handleInputChange("username", value)}
            placeholder="Enter username"
          />
        </View>

        {/* Email */}
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

        {/* Password */}
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
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Birthday */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Birthday</Text>
          <TextInput
            style={[styles.input, birthdayError ? { borderColor: "red" } : {}]}
            value={formData.birthday}
            onChangeText={handleBirthdayChange}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            maxLength={10}
          />
          {birthdayError !== "" && (
            <Text style={{ color: "red", marginTop: 4 }}>{birthdayError}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
})


