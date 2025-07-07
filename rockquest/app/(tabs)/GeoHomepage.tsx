"use client"
import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function Dashboard() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
    
    <View style={styles.contentWrapper}>
      {/* Header with Greeting & Profile */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingWrapper}>
          <View style={styles.greetingBanner}>
            <View style={styles.greetingTextBlock}>
              <Text style={styles.greetingTitle}>Hello, Geologist!</Text>
              <Text style={styles.greetingSubtitle}>
                Are you updated with the{" "}
                <Text style={styles.greetingLink} onPress={() => router.replace("/(tabs)/GeoPosts")}>
                  news?
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileIcon}
          activeOpacity={0.8}
          onPress={() => router.replace("/(tabs)/GeoProfile")}
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.shortcutContainer}>
        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => router.replace("/(tabs)/GeoPosts")}
        >
          <Text style={styles.shortcutText}>View Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutButton}
          onPress={() => router.replace("/(tabs)/GeoReviewPosts")}
        >
          <Text style={styles.shortcutText}>Review Posts</Text>
        </TouchableOpacity>
      </View>
    </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/GeoHomepage")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/GeoPosts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77"  />
            <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/auth")}>
          <Ionicons name="log-out" size={24} color="#BA9B77"  />
            <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// CSS Style Sheet
const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    position: "relative",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  contentWrapper: {
    flex: 1,
    paddingBottom: 100, 
  },

  greetingWrapper: {
    flex: 1,
    marginRight: 12,
  },

  greetingBanner: {
    backgroundColor: "#A77B4E",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  
  greetingTextBlock: {
    flexDirection: "column",
  },

  greetingTitle: {
    color: "white",
    fontSize: 12,
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 4,
  },

  greetingSubtitle: {
    color: "white",
    fontSize: 12,
  },

  greetingLink: {
    textDecorationLine: "underline",
    fontWeight: "bold",
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
  },

  shortcutContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
    gap: 12,
  },

  shortcutButton: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "flex-start",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  shortcutText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
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
  },
})

