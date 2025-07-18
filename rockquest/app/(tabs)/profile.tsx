"use client"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "../../utils/firebase" // Adjust the import path as needed

SplashScreen.preventAutoHideAsync()

export default function ProfileScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/profile")}>
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
              <Text style={styles.username}>Username</Text>
              <Text style={styles.playerLabel}>Player</Text>
              <View style={styles.birthdayContainer}>
                <Ionicons name="gift" size={16} color="#A77B4E" />
                <Text style={styles.birthdayText}>Birthday</Text>
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

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Achievements:</Text>
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
                <Text style={styles.trackerNumber}>100</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons name="create" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons name="trophy" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={async () => {
              try {
                await FIREBASE_AUTH.signOut();
                router.replace("/(tabs)/auth");
              } catch (error) {
                const errorMessage = (error instanceof Error && error.message) ? error.message : "Failed to log out.";
                Alert.alert("Logout Error", errorMessage);
              }
            }}
          >
            <Ionicons name="log-out" size={20} color="#1f2937" />
            <Text style={styles.actionButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/dashboard")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/camera")}>
          <Ionicons name="camera" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/collections")}>
          <MaterialIcons name="collections" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/posts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77"  />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

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
  subtitle: {
    fontSize: 18,
    color: "#1f2937",
    fontWeight: "600",
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
  profilePicturePlaceholder: {
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
})
