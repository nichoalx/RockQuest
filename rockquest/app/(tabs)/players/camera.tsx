"use client"
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Dimensions, Alert, Image } from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import BottomNav from "@/components/BottomNav"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/api"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

const { width } = Dimensions.get("window")

export default function CameraScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [permission, requestPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions()
  const cameraRef = useRef<any>(null)
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [bootLoading, setBootLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setAvatarSrc(avatarFromId(data?.avatarId))
      } catch (e) {
        console.log("getProfile error (camera):", e)
      } finally {
        setBootLoading(false)
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
    if (!permission?.granted) requestPermission()
    if (!mediaPermission?.granted) requestMediaPermission()
  }, [fontsLoaded, permission])

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
        const photo = await cameraRef.current.takePictureAsync({ base64: false })
        const asset = await MediaLibrary.createAssetAsync(photo.uri)
        console.log("Saved to gallery:", asset)
        Alert.alert("Success", "Photo saved to your gallery!")
      } catch (error) {
        console.error("Error taking/saving picture:", error)
        Alert.alert("Error", "Failed to take or save the picture.")
      }
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header (fixed) */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Scan Rock</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/players/profile")} activeOpacity={0.9}>
            <Image source={avatarSrc} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View style={styles.overlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.bracket, styles.topLeft]} />
            <View style={[styles.bracket, styles.topRight]} />
            <View style={[styles.bracket, styles.bottomLeft]} />
            <View style={[styles.bracket, styles.bottomRight]} />
          </View>
        </View>
      </View>

      {/* Capture Button (raised above BottomNav) */}
      <View style={[styles.captureContainer, { bottom: BOTTOM_NAV_HEIGHT + 12 }]}>
        <TouchableOpacity style={styles.captureButton} activeOpacity={0.8} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      <BottomNav
        items={[
          { label: "Home", route: "/(tabs)/players/dashboard", icon: { lib: "ion", name: "home" } },
          { label: "Scan", route: "/(tabs)/players/camera", icon: { lib: "ion", name: "camera" } },
          { label: "Collections", route: "/(tabs)/players/collections", icon: { lib: "mat", name: "collections" } },
          { label: "Posts", route: "/(tabs)/players/posts", icon: { lib: "ion", name: "chatbubbles" } },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "black",
  },

  /* Header */
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 2,
  },
  headerContent: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "white",
    marginBottom: 8,
    marginTop: 20,
  },
  profileIcon: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  /* Camera */
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
    width: 40, height: 40,
    borderColor: "white",
    borderWidth: 3,
  container: { flex: 1, backgroundColor: "black" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    top: 0, left: 0, right: 0, zIndex: 1,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontFamily: "PressStart2P_400Regular", fontSize: 20, color: "white", marginBottom: 8, marginTop: 20 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginTop: 10, borderWidth: 2, borderColor: "white" },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center" },
  viewfinder: { width: width - 80, height: width - 80, position: "relative" },
  bracket: { position: "absolute", width: 40, height: 40, borderColor: "white", borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  /* Capture */
  captureContainer: { 
    position: "absolute",
    left: 0, right: 0,
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 3,
  },
  captureButton: {
    width: 80, height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  captureButtonInner: {
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },

  /* Fixed BottomNav (collections behavior) */
  bottomNavWrap: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    zIndex: 4,
  },

  /* Permissions */
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
