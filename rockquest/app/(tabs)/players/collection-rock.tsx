import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { useRouter, useLocalSearchParams } from 'expo-router'
import BottomNav from '@/components/BottomNav'
import { rockMeta, rockImages, isKnownClass, RockClass } from "@/utils/rocks"
import { avatarFromId } from "@/utils/avatar"
import { getProfile } from "@/utils/userApi"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { deleteRockFromCollection } from "@/utils/playerApi"

import rockinfo from '@/assets/images/rockinfo.png'

// ==== Class -> rockId map (reuse from Camera screen so IDs stay consistent) ====
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

const HEADER_HEIGHT = 88   // visual header height (including padding)
const BOTTOM_NAV_HEIGHT = 78
const { width } = Dimensions.get('window')

export default function RockCollectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ rockClass: string }>()
  const rockClass = params.rockClass as RockClass

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))

  // fetch avatar like in Camera screen
  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setAvatarSrc(avatarFromId(data?.avatarId))
      } catch (e) {
        console.log("getProfile error (collection):", e)
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  if (!fontsLoaded) return null

  if (!rockClass || !isKnownClass(rockClass)) {
    return (<Text style={{ color: "white", fontSize: 16 }}>Unknown rock</Text>)
  }

  const rockInfo = rockMeta[rockClass]
  const rockImage = rockImages[rockClass]

  const handleDelete = async () => {
    const rockId = ROCK_ID_BY_CLASS[rockClass] || (rockClass as string)

    Alert.alert(
      "Delete Rock",
      `Remove ${rockClass} from your collection?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRockFromCollection(rockId)
              Alert.alert("Deleted", `${rockClass} removed from your collection.`)
              router.replace("/(tabs)/players/collections")
            } catch (e) {
              console.error("deleteRockFromCollection error:", e)
              Alert.alert("Error", "Failed to delete this rock. Please try again.")
            }
          },
        },
      ]
    )
  }

  return (
    <ImageBackground source={rockinfo} style={styles.background} imageStyle={styles.bgImage}>
      <StatusBar barStyle="dark-content" />

      {/* Header (fixed) */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/(tabs)/players/collections")} activeOpacity={0.8}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Rock Collection</Text>
            </View>

            {/* Profile avatar links to profile screen */}
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/players/profile")}
              activeOpacity={0.9}
              style={styles.profileIcon}
            >
              <Image source={avatarSrc} style={styles.profileImg} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Middle content area (non-scrollable, fixed height) */}
      <View style={styles.contentArea}>
        {/* Rock Image */}
        <View style={styles.imageContainer}>
          <Image
            source={rockImage}
            style={styles.rockImage}
            resizeMode="cover"
          />
        </View>

        {/* Rock Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name: </Text>
            <Text style={styles.infoValue}>{rockClass}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type: </Text>
            <Text style={styles.infoValue}>{rockInfo.type}</Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.infoLabel}>About:</Text>
            <Text style={styles.aboutText} numberOfLines={6}>{rockInfo.description}</Text>
          </View>

          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation (fixed) */}
      <View pointerEvents="box-none" style={styles.bottomNavWrap}>
        <BottomNav
          items={[
            { label: 'Home', route: '/(tabs)/players/dashboard', icon: { lib: 'ion', name: 'home' } },
            { label: 'Scan', route: '/(tabs)/players/camera', icon: { lib: 'ion', name: 'camera' } },
            { label: 'Collections', route: '/(tabs)/players/collections', icon: { lib: 'mat', name: 'collections' } },
            { label: 'Posts', route: '/(tabs)/players/posts', icon: { lib: 'ion', name: 'chatbubbles' } },
          ]}
        />
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#2C1810",
  },
  bgImage: {
    resizeMode: "cover",
    opacity: 0.4,
  },

  /* Header (fixed) */
  headerSafe: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.select({ ios: 8, android: 16 }),
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "rgba(167, 123, 78, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    height: HEADER_HEIGHT - 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 10,
    fontFamily: "PressStart2P_400Regular",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImg: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },

  /* Middle content (no scrolling) */
  contentArea: {
    flex: 1,
    paddingTop: HEADER_HEIGHT + 8,
    paddingBottom: BOTTOM_NAV_HEIGHT + 12,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
  },
  imageContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 24,
  },
  rockImage: {
    width: width * 0.85,
    height: width * 0.55,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#A77B4E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  infoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(167, 123, 78, 0.3)",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontWeight: "700",
    color: "#A77B4E",
    fontSize: 16,
    minWidth: 60,
  },
  infoValue: {
    color: "#2C1810",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textTransform: "capitalize",
  },
  aboutSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(167, 123, 78, 0.2)",
  },
  aboutText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    textAlign: "justify",
  },
  deleteButton: {
    alignSelf: "center",
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#DC2626",
    borderRadius: 25,
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Bottom nav (fixed) */
  bottomNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_NAV_HEIGHT,
    justifyContent: "flex-end",
  },
})
