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
import { scanRockFromUri, type ScanResult, addRockToCollection } from "@/utils/playerApi"
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

  const [errorModalVisible, setErrorModalVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

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
    const { rawLabel, predictedType, confidenceScore } = result

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
            setErrorMessage(
              "We need permission to save photos to your gallery. Please allow access in your device settings.",
            )
            setErrorModalVisible(true)
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
      let errorMsg =
        "We're sorry, but we couldn't identify this rock. Please try again with better lighting or a clearer image."

      if (error.response?.status === 422) {
        const detail = error.response.data?.detail
        if (typeof detail === "object" && detail?.message) {
          errorMsg = `Sorry! ${detail.message}`
        } else if (typeof detail === "string") {
          errorMsg = `Sorry! ${detail}`
        } else {
          errorMsg = "Sorry! Rock detection confidence too low. Try getting closer or improving lighting."
        }
      } else if (error.response?.status === 401) {
        errorMsg = "Sorry! Authentication failed. Please log in again."
      } else if (error.response?.status === 500) {
        errorMsg = "Sorry! Server error. Please try again later."
      } else if (error.code === "NETWORK_ERROR" || error.message?.includes("Network")) {
        errorMsg = "Sorry! Network error. Please check your connection and try again."
      } else if (error.code === "TIMEOUT" || error.message?.includes("timeout")) {
        errorMsg = "Sorry! Request timed out. Please try again."
      }

      setErrorMessage(errorMsg)
      setErrorModalVisible(true)
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
        setErrorMessage("Sorry! We couldn't find the rock ID for this specimen.")
        setErrorModalVisible(true)
        return
      }

      // we can pass imageUrl: null to let backend/canonical image be used
      await addRockToCollection({ rockId, imageUrl: null as any })

      Alert.alert("Success", "Rock added to your collection!")
      setModalVisible(false)
    } catch (error) {
      console.error("Failed to add rock to collection:", error)
      setErrorMessage("Sorry! We couldn't add this rock to your collection. Please try again.")
      setErrorModalVisible(true)
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

            {/* Success Header */}
            <View style={styles.successHeader}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Rock Identified!</Text>
            </View>

            {/* Rock Image */}
            {modalImage ? (
              <View style={styles.imageContainer}>
                <Image source={modalImage} style={styles.modalImage} />
              </View>
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>🪨</Text>
              </View>
            )}

            {/* Confidence Message */}
            {scan?.confidenceScore != null && (
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceMessage}>
                  We are {(scan.confidenceScore * 100).toFixed(0)}% certain this is a {modalTitle}!
                </Text>
              </View>
            )}

            {/* Rock Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{modalType}</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>About this rock:</Text>
                <Text style={styles.modalDesc}>{modalDesc}</Text>
              </View>
            </View>

            {/* Action Buttons */}
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

      <Modal
        visible={errorModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContent}>
            {/* Cute sad face */}
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>😔</Text>
            </View>

            {/* Sorry title */}
            <Text style={styles.errorTitle}>Oops!</Text>

            {/* Error message */}
            <Text style={styles.errorText}>{errorMessage}</Text>

            {/* Cute decorative elements */}
            <View style={styles.errorDecorations}>
              <View style={styles.errorDot} />
              <View style={styles.errorDot} />
              <View style={styles.errorDot} />
            </View>

            {/* Try again button */}
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => setErrorModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.errorButtonText}>Try Again</Text>
            </TouchableOpacity>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 3,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 2,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    minHeight: height * 0.6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    marginBottom: 24,
  },

  // Success Header
  successHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successIconText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  // Image Container
  imageContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalImage: {
    width: 160,
    height: 130,
    resizeMode: "contain",
  },
  placeholderImage: {
    width: 160,
    height: 130,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  placeholderText: {
    fontSize: 48,
  },

  // Confidence Message
  confidenceContainer: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  confidenceMessage: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    textAlign: "center",
    lineHeight: 22,
  },

  // Details Section
  detailsContainer: {
    width: "100%",
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textTransform: "capitalize",
  },
  descriptionContainer: {
    backgroundColor: "#FEFEFE",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    textAlign: "left",
    color: "#6B7280",
    lineHeight: 20,
  },

  // Enhanced Buttons
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  addButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    maxWidth: 160,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#6B7280",
    paddingHorizontal: 24,
    paddingVertical: 23,
    borderRadius: 12,
    flex: 1,
    maxWidth: 100,
  },
  modalClose: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },

  errorModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorModalContent: {
    backgroundColor: "#FEF7F7",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: "center",
    maxWidth: 320,
    width: "100%",
    borderWidth: 2,
    borderColor: "#FED7D7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FED7D7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FBB6CE",
  },
  errorIconText: {
    fontSize: 36,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#C53030",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#744210",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  errorDecorations: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  errorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FBB6CE",
  },
  errorButton: {
    backgroundColor: "#E53E3E",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#E53E3E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
})
