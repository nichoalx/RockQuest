"use client"
import { View, Text, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function Dashboard() {
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

  const rockData = [
    { id: 1, name: "Granite" },
    { id: 2, name: "Quartz" },
    { id: 3, name: "Basalt" },
  ]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header with Profile Icon */}
        <View style={styles.profileIconContainer}>
          <TouchableOpacity style={styles.profileIcon}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hello, Player Username</Text>
          <Text style={styles.newsText}>
            Are you updated with the <Text style={styles.newsLink}>news</Text>?
          </Text>
        </View>

        {/* Quest Panel - Floating */}
        <View style={styles.questPanelContainer}>
          <TouchableOpacity style={styles.questPanel} activeOpacity={0.8}>
            <View style={styles.questContent}>
              <View style={styles.questLeft}>
                <View style={styles.questIcon}>
                  <Ionicons name="location" size={16} color="white" />
                </View>
                <View style={styles.questTextContainer}>
                  <Text style={styles.questTitle}>Today's Quest</Text>
                  <Text style={styles.questDescription}>Take pictures of 3 rocks</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A77B4E" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Map Area */}
        <View style={styles.mapContainer}>
          <LinearGradient colors={["#C0BAA9", "#CCCABC"]} style={styles.mapGradient}>
            {/* Map Grid Pattern */}
            <View style={styles.mapGrid}>
              <View style={styles.gridRow}>
                {[...Array(4)].map((_, i) => (
                  <View key={i} style={styles.gridColumn}>
                    {[...Array(6)].map((_, j) => (
                      <View key={j} style={styles.gridCell} />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Rock Markers */}
            <View style={[styles.rockMarker, { top: 60, left: 30 }]}>
              <View style={styles.rockIcon}>
                <Text style={styles.rockText}>R</Text>
              </View>
              <Text style={styles.rockLabel}>rock</Text>
            </View>

            <View style={[styles.rockMarker, { top: 120, right: 50 }]}>
              <View style={styles.rockIcon}>
                <Text style={styles.rockText}>R</Text>
              </View>
              <Text style={styles.rockLabel}>rock</Text>
            </View>

            <View style={[styles.rockMarker, { bottom: 120, left: 60 }]}>
              <View style={styles.rockIcon}>
                <Text style={styles.rockText}>R</Text>
              </View>
              <Text style={styles.rockLabel}>rock</Text>
            </View>

            <View style={[styles.rockMarker, { bottom: 80, right: 30 }]}>
              <View style={styles.rockIcon}>
                <Text style={styles.rockText}>R</Text>
              </View>
              <Text style={styles.rockLabel}>rock</Text>
            </View>

            {/* User Location */}
            <View style={styles.userLocation}>
              <View style={styles.userIcon}>
                <Text style={styles.userText}>YOU</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Rocks Nearby Section */}
        <View style={styles.rocksSection}>
          <View style={styles.rocksSectionContent}>
            <View style={styles.rocksSectionHeader}>
              <Text style={styles.rocksSectionTitle}>Rocks Located...</Text>
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rocksScroll}>
              <View style={styles.rocksContainer}>
                {rockData.map((rock) => (
                  <TouchableOpacity key={rock.id} style={styles.rockCard} activeOpacity={0.8}>
                    <View style={styles.rockCardImage}>
                      <Text style={styles.rockCardText}>Rock</Text>
                    </View>
                    <Text style={styles.rockCardName}>{rock.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <Ionicons name="home" size={24} color="#A77B4E" />
            <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <Ionicons name="camera" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <MaterialIcons name="collections" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Collections</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
            <Ionicons name="person" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  mainContent: {
    flex: 1,
  },
  profileIconContainer: {
    position: "absolute",
    top: 48,
    right: 16,
    zIndex: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greetingContainer: {
    position: "absolute",
    top: 64,
    left: 16,
    right: 64,
    zIndex: 10,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  newsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  newsLink: {
    color: "#A77B4E",
  },
  questPanelContainer: {
    position: "absolute",
    top: 112,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  questPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  questLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  questIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questTextContainer: {
    flex: 1,
  },
  questTitle: {
    fontSize: 14,
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  mapContainer: {
    flex: 1,
    marginTop: 80,
  },
  mapGradient: {
    flex: 1,
    position: "relative",
  },
  mapGrid: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridRow: {
    flex: 1,
    flexDirection: "row",
  },
  gridColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  gridCell: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  rockMarker: {
    position: "absolute",
    alignItems: "center",
  },
  rockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  rockText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  rockLabel: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  userLocation: {
    position: "absolute",
    bottom: 160,
    left: width / 2 - 16,
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#BA9B77",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  userText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  rocksSection: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    height: height * 0.25,
  },
  rocksSectionContent: {
    padding: 16,
    flex: 1,
  },
  rocksSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rocksSectionTitle: {
    fontSize: 16,
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  rocksScroll: {
    flex: 1,
  },
  rocksContainer: {
    flexDirection: "row",
    gap: 12,
  },
  rockCard: {
    alignItems: "center",
  },
  rockCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#C0BAA9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  rockCardText: {
    fontSize: 12,
    color: "#6b7280",
  },
  rockCardName: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
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
  navTextActive: {
    color: "#A77B4E",
  },
})
