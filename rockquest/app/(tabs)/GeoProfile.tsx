"use client"

import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import React, { useEffect, useState, useCallback } from "react"
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { useFocusEffect } from "@react-navigation/native"

export default function GeoProfile() {
  const router = useRouter()
  const [username, setUsername] = useState("Username")
  const [birthday, setBirthday] = useState("")

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const savedUsername = await AsyncStorage.getItem("userName")
          const savedBirthday = await AsyncStorage.getItem("userBirthday")

          if (savedUsername) {
            setUsername(savedUsername)
          } else {
            setUsername("Username")
          }

          if (savedBirthday) {
            setBirthday(savedBirthday)
          } else {
            setBirthday("")
          }
        } catch (error) {
          console.error("Failed to load profile data", error)
        }
      }
      loadProfile()
    }, [])
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.replace("/(tabs)/edit-profile")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* Profile Picture and Info */}
          <View style={styles.profileSection}>
            <View style={styles.profilePicture}>
              <View style={styles.profilePicturePlaceholder} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <Text style={styles.playerLabel}>Geologist</Text>
              <View style={styles.birthdayContainer}>
                <Ionicons name="gift" size={16} color="#A77B4E" />
                <Text style={styles.birthdayText}>
                  {birthday ? birthday : "Birthday"}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>
              Add a short description about yourself.{"\n"}
              Set a character limit to the text field.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/edit-profile")}
          >
            <Ionicons name="create" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/auth")}
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
          onPress={() => router.replace("/(tabs)/GeoHomepage")}
        >
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/GeoPosts")}
        >
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/auth")}
        >
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles remain the same as your original GeoProfile page
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
})


