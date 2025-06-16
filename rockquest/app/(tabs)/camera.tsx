"use client"
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router";


SplashScreen.preventAutoHideAsync()

const { width } = Dimensions.get("window")

export default function CameraScreen() {
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
            <Text style={styles.title}>Scan Rock</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon } onPress={() => router.replace("/(tabs)/profile")}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera Viewfinder */}
      <View style={styles.cameraContainer}>
        <View style={styles.viewfinder}>
          {/* Corner brackets */}
          <View style={[styles.bracket, styles.topLeft]} />
          <View style={[styles.bracket, styles.topRight]} />
          <View style={[styles.bracket, styles.bottomLeft]} />
          <View style={[styles.bracket, styles.bottomRight]} />

          {/* Rock image placeholder */}
          <View style={styles.rockImageContainer}>
            <View style={styles.rockImage}>
              <Text style={styles.rockImageText}>Rock Sample</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity style={styles.captureButton} activeOpacity={0.8}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/dashboard")}>
        <Ionicons name="home" size={24} color="#BA9B77" />
        <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/camera")}>
          <Ionicons name="camera" size={24} color="#A77B4E" />
          <Text style={[styles.navText, styles.navTextActive]}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/collections")}>
          <MaterialIcons name="collections" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/posts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
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
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  viewfinder: {
    width: width - 80,
    height: width - 80,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  bracket: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#1f2937",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  rockImageContainer: {
    width: "70%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  rockImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#C0BAA9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rockImageText: {
    color: "#6b7280",
    fontSize: 14,
  },
  captureContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#1f2937",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1f2937",
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
