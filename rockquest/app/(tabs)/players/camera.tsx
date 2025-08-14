"use client"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Switch,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "expo-router"
import { CameraView, useCameraPermissions } from "expo-camera"
import * as MediaLibrary from "expo-media-library"
import BottomNav from "@/components/BottomNav"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/userApi"
import { scanRockFromUri, ScanResult, addRockToCollection } from "@/utils/playerApi"
import { avatarFromId } from "@/utils/avatar"
import { rockImages, rockMeta, isKnownClass } from "@/utils/rocks"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

// ==== Class -> rockId map (fill in if your IDs differ) ====
const ROCK_ID_BY_CLASS: Record<string, string> = {
  Basalt: "R001",
  Conglomerate: "R002",
  Dolerite: "R003",
  Gneiss: "R004",
  Granite: "R005",
  Limestone: "R006",
  Mudstone: "R007",
  Norite: "R008",
  Quartzite: "R009",
  Sandstone: "R010",
  Schist: "R011",
  Shale: "R012",
  Tuff: "R013",
}

export default function CameraScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [permission, requestPermission] = useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions()
  const cameraRef = useRef<any>(null)

  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [bootLoading, setBootLoading] = useState(true)

  // gallery toggle
  const [saveToGallery, setSaveToGallery] = useState(false)

  // modal state
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [scan, setScan] = useState<ScanResult | null>(null)
  const [modalImage, setModalImage] = useState<any>(null)
  const [modalTitle, setModalTitle] = useState<string>("")
  const [modalType, setModalType] = useState<string>("")
  const [modalDesc, setModalDesc] = useState<string>("")

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
    // only ask media permission when the user enables the toggle
    // (we'll still request lazily in handleCapture if needed)
  }, [fontsLoaded, permission])

  if (!fontsLoaded) return null

  const openResultModal = (result: ScanResult) => {
    const { rawLabel, predictedType } = result
    
    // Use the EXACT class name from Roboflow output to resolve local assets
    if (isKnownClass(rawLabel)) {
      setModalImage(rockImages[rawLabel])
      setModalTitle(rawLabel)
      const meta = rockMeta[rawLabel]
      setModalType((predictedType as string) || meta.type)
      setModalDesc(meta.description)
    } else {
      // fallback
      setModalImage(null)
      setModalTitle(rawLabel || "Unknown")
      setModalType((predictedType as string) || "unknown")
      setModalDesc("No description available.")
    }
    setScan(result)
    setModalVisible(true)
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return
    try {
      setModalLoading(true)

      // 1) take photo
      const photo = await cameraRef.current.takePictureAsync({ base64: false })

      // 2) Optional: save to gallery IF toggled
      if (saveToGallery) {
        // request permission lazily if not yet granted
        if (!mediaPermission?.granted) {
          const req = await requestMediaPermission()
          if (!req.granted) {
            Alert.alert("Permission needed", "Allow Photos access to save your picture.")
          } else {
            try {
              await MediaLibrary.createAssetAsync(photo.uri)
            } catch (e) {
              console.log("Failed to save to gallery:", e)
            }
          }
        } else {
          try {
            await MediaLibrary.createAssetAsync(photo.uri)
          } catch (e) {
            console.log("Failed to save to gallery:", e)
          }
        }
      }

      // 3) upload to backend
      const result = await scanRockFromUri(photo.uri, "scan.jpg")
      openResultModal(result)
      
    } catch (error: any) {
      console.error("scan error:", error)
      let errorMessage = "Failed to scan this image."
      
      if (error.response?.status === 422) {
        const detail = error.response.data?.detail
        if (typeof detail === 'object' && detail?.message) {
          errorMessage = detail.message
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else {
          errorMessage = "Rock detection confidence too low. Try getting closer or improving lighting."
        }
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later."
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
        errorMessage = "Network error. Please check your connection."
      } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please try again."
      }
      
      Alert.alert("Scan Error", errorMessage)
    } finally {
      setModalLoading(false)
    }
  }

  const handleAddToCollection = async () => {
    if (!scan) return
    
    try {
      // derive a rockId for the backend (R001…R013 by class name)
      const raw = scan.rawLabel
      const rockId = ROCK_ID_BY_CLASS[raw] || raw // fallback if your doc IDs are class names

      if (!rockId) {
        Alert.alert("Error", "Unknown rock ID for this class.")
        return
      }

      // we can pass imageUrl: null to let backend/canonical image be used
      await addRockToCollection({ rockId, imageUrl: null as any })

      Alert.alert("Success", "Rock added to your collection!")
      setModalVisible(false)
    } catch (error) {
      console.error("Failed to add rock to collection:", error)
      Alert.alert("Error", "Failed to add rock to collection.")
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Scan Rock</Text>
            <View style={styles.saveRow}>
              <Text style={styles.saveRowText}>Save to Photos</Text>
              <Switch value={saveToGallery} onValueChange={setSaveToGallery} />
            </View>
          </View>
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

      {/* Loading Overlay - Freezes the screen during processing */}
      {modalLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#A77B4E" />
            </View>
            <Text style={styles.loadingTitle}>Analyzing Rock...</Text>
            <Text style={styles.loadingSubtitle}>Our AI is identifying your specimen</Text>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </View>
        </View>
      )}

      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity 
          style={[styles.captureButton, modalLoading && styles.captureButtonDisabled]} 
          activeOpacity={0.8} 
          onPress={handleCapture} 
          disabled={modalLoading}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            {modalImage ? <Image source={modalImage} style={styles.modalImage} /> : null}
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            {scan?.confidenceScore != null && (
              <Text style={styles.modalConf}>Confidence: {(scan.confidenceScore * 100).toFixed(1)}%</Text>
            )}
            <Text style={styles.modalType}>Type: {modalType}</Text>
            <Text style={styles.modalDesc}>{modalDesc}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleAddToCollection} style={styles.addButton}>
                <Text style={styles.addButtonText}>Add to Collection</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  container: { flex: 1, backgroundColor: "black" },
  header: {
    paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)", position: "absolute", top: 0, left: 0, right: 0, zIndex: 1,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontFamily: "PressStart2P_400Regular", fontSize: 20, color: "white", marginBottom: 8, marginTop: 20 },
  // NEW: tiny row under title
  saveRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  saveRowText: { color: "white", fontSize: 12, opacity: 0.8 },

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

  captureContainer: {
    position: "absolute", bottom: 100, left: 0, right: 0,
    alignItems: "center", paddingVertical: 30, marginBottom: 3,
    backgroundColor: "rgba(0,0,0,0.3)", zIndex: 2,
  },
  captureButton: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: "white",
    justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)",
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "white" },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingContent: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A77B4E",
    marginHorizontal: 3,
  },
  dot1: { animationDelay: "0ms" as any },
  dot2: { animationDelay: "150ms" as any },
  dot3: { animationDelay: "300ms" as any },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
    backgroundColor: "white", paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: "center",
    minHeight: height * 0.5,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, marginBottom: 20 },
  modalImage: { width: 150, height: 120, resizeMode: "contain", marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: "700", marginBottom: 6, color: "#111827" },
  modalConf: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  modalType: { fontSize: 14, color: "#374151", marginBottom: 12 },
  modalDesc: { fontSize: 15, textAlign: "center", color: "#6B7280", marginBottom: 24, lineHeight: 22, paddingHorizontal: 4 },
  
  modalButtons: { 
    flexDirection: "row", 
    gap: 12, 
    marginTop: "auto",
    width: "100%",
    justifyContent: "center",
  },
  addButton: { 
    backgroundColor: "#10B981", 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 24,
    flex: 1,
    maxWidth: 140,
  },
  addButtonText: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: { 
    backgroundColor: "#A77B4E", 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 24,
    flex: 1,
    maxWidth: 100,
  },
  modalClose: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 16,
    textAlign: "center",
  },
})
