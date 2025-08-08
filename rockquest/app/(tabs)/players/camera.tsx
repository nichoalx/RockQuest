"use client"
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions } from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useRef, useState } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { CameraView, useCameraPermissions } from "expo-camera"
import BottomNav from "@/components/BottomNav";

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

export default function CameraScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<any>(null)

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  // Debug: Log permission status
  console.log("Permission status:", permission)

  if (!fontsLoaded) return null
  
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading camera permissions...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.8,
        })
        console.log("Captured:", photo.uri)
        // router.push({ pathname: "/(tabs)/scan-result", params: { uri: photo.uri } })
      } catch (error) {
        console.error("Error taking picture:", error)
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Scan Rock</Text>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/players/profile")}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View - Simplified */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          {/* Overlay with brackets */}
          <View style={styles.overlay}>
            <View style={styles.viewfinder}>
              <View style={[styles.bracket, styles.topLeft]} />
              <View style={[styles.bracket, styles.topRight]} />
              <View style={[styles.bracket, styles.bottomLeft]} />
              <View style={[styles.bracket, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>
      </View>

      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity style={styles.captureButton} activeOpacity={0.8} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "black" // Changed to black for better camera visibility
  },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)", // Semi-transparent overlay
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerContent: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start" 
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "white", // Changed to white for visibility
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
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinder: {
    width: width - 80,
    height: width - 80,
    position: "relative",
  },
  bracket: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "white", // Changed to white for visibility
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  captureContainer: { 
    alignItems: "center", 
    paddingVertical: 40,
    backgroundColor: "rgba(0,0,0,0.3)", // Semi-transparent overlay
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white", // Changed to white
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#1f2937",
  },
  permissionButton: {
    backgroundColor: "#A77B4E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})