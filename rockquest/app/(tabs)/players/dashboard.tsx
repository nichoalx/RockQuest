"use client"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Pressable,
  GestureResponderEvent,
  TextInput,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import MapComponent from "../../../components/MapComponent"
import BottomNav from "@/components/BottomNav"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function Dashboard() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  const [showGreeting, setShowGreeting] = useState(true)
  const [customMarkers, setCustomMarkers] = useState<
    { id: number; x: number; y: number; detail: string; description: string }[]
  >([])

  const [selectedMarker, setSelectedMarker] = useState<
    { id: number; x: number; y: number; detail: string; description: string } | null
  >(null)

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const rockData = [
    { id: 1, name: "Granite" },
    { id: 2, name: "Quartz" },
    { id: 3, name: "Basalt" },
  ]

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Main Content */}
      <View style={{ flex: 1, position: "relative" }}>
        {/* Header with Profile Icon */}
        <View style={styles.profileIconContainer}>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/players/profile")}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {showGreeting && (
          <View style={styles.greetingPanelContainer}>
            <TouchableOpacity style={styles.greetingPanel} onPress={() => setShowGreeting(false)}>
              <View style={styles.greetingContent}>
                <View style={styles.greetingLeft}>
                  <View style={styles.greetingIcon}>
                    <Ionicons name="notifications" size={16} color="white" />
                  </View>
                  <View style={styles.greetingTextContainer}>
                    <Text style={styles.greetingTitle}>Hello, Player!</Text>
                    <Text style={styles.greetingDescription}>Check out the latest news</Text>
                  </View>
                </View>
                <Ionicons name="close" size={20} color="#A77B4E" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.questPanelContainer, { top: showGreeting ? 160 : 80 }]}>
          <TouchableOpacity style={styles.questPanel} onPress={() => router.push("/players/quest")}>
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
        <MapComponent />

        <View style={styles.rocksSection}>
          <View style={styles.rocksSectionContent}>
            <View style={styles.rocksSectionHeader}>
              <Text style={styles.rocksSectionTitle}>Rocks Located...</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => alert("Tap anywhere on the map to add a marker!")}
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rocksScroll}>
              <View style={styles.rocksContainer}>
                {rockData.map((rock) => (
                  <TouchableOpacity key={rock.id} style={styles.rockCard}>
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

        {selectedMarker && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Editable Rock Detail Title */}
              <TextInput
                style={styles.modalTitleInput}
                placeholder="Custom Marker"
                placeholderTextColor="#aaa"
                value={selectedMarker.detail}
                onChangeText={(text) => {
                  setSelectedMarker({ ...selectedMarker, detail: text })
                  setCustomMarkers((prev) =>
                    prev.map((m) => (m.id === selectedMarker.id ? { ...m, detail: text } : m))
                  )
                }}
                autoFocus
              />

              {/* Editable Description Field */}
              <TextInput
                style={styles.modalTextField}
                placeholder="Enter details"
                placeholderTextColor="#aaa"
                value={selectedMarker.description}
                onChangeText={(text) => {
                  setSelectedMarker({ ...selectedMarker, description: text })
                  setCustomMarkers((prev) =>
                    prev.map((m) => (m.id === selectedMarker.id ? { ...m, description: text } : m))
                  )
                }}
                multiline
              />

              <Text style={styles.modalSubtitle}>
                Coordinates: X: {Math.round(selectedMarker.x)}, Y: {Math.round(selectedMarker.y)}
              </Text>

              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={() => {
                  setCustomMarkers(customMarkers.filter((m) => m.id !== selectedMarker.id))
                  setSelectedMarker(null)
                }}
              >
                <Text style={styles.modalDeleteText}>🗑 Remove Marker</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setSelectedMarker(null)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  profileIconContainer: {
    position: "absolute",
    top: 80,
    right: 16,
    zIndex: 30,
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
  greetingPanelContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 72,
    zIndex: 10,
  },
  greetingPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greetingContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greetingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  greetingIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 14,
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 4,
  },
  greetingDescription: {
    fontSize: 12,
    color: "#6b7280",
  },
  questPanelContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 72,
    zIndex: 15,
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
  rocksSection: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flex: 1,
    minHeight: 200,
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

  // Modal Styles
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitleInput: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    textAlign: "center",
  },
  modalTextField: {
    fontSize: 14,
    marginBottom: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f9f9f9",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  modalDeleteButton: {
    backgroundColor: "#e53e3e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalDeleteText: {
    color: "white",
    fontWeight: "bold",
  },
  modalCloseText: {
    color: "#A77B4E",
    fontWeight: "bold",
    fontSize: 14,
  },
})
