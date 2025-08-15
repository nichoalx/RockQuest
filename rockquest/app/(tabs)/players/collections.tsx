import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter, useLocalSearchParams } from "expo-router"
import BottomNav from "@/components/BottomNav"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"
import { rockMeta, rockImages, RockClass } from "@/utils/rocks"
import { getMyRocks } from "@/utils/playerApi"
import { getBadges, badgeImages } from "@/utils/badgesApi"

import cbg_rocks from "@/assets/images/cbg_rocks.png"
import cbg_badge from "@/assets/images/cbg_badges.png"

SplashScreen.preventAutoHideAsync()

type Badge = {
  id: string
  name: string
  imageKey: keyof typeof badgeImages
  kind: "scan" | "post"
  threshold: number
  progress: number
  earned: boolean
}

export default function CollectionsScreen() {
  const router = useRouter()

<<<<<<< HEAD
  // --- NEW: read `tab` param and compute initial tab before state init
  const params = useLocalSearchParams<{ tab?: string | string[] }>()
  const tabParamRaw = Array.isArray(params.tab) ? params.tab[0] : params.tab
  const initialTab = tabParamRaw === "Badges" ? "Badges" : "Rocks"

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [activeTab, setActiveTab] = useState<"Rocks" | "Badges">(initialTab)
=======
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [collected, setCollected] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<"Rocks" | "Badges">("Rocks")
>>>>>>> origin/main
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [badges, setBadges] = useState<Badge[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)

  // -------- loaders --------
  const loadBadges = async () => {
    try {
      setBadgesLoading(true)
      const res = await getBadges()
      setBadges(res.badges || [])
    } catch (e) {
      console.log("badges load error:", e)
      Alert.alert("Error", "Failed to load badges.")
    } finally {
      setBadgesLoading(false)
    }
  }

  const loadCollections = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser
      if (!user) return

      const [profileRes, rocksRes] = await Promise.all([getProfile(), getMyRocks()])
      setAvatarSrc(avatarFromId(profileRes?.avatarId))

      const list = Array.isArray(rocksRes) ? rocksRes : (rocksRes?.rocks || [])
      const map: Record<string, number> = {}
      const names = new Set<string>()

      for (const r of list) {
        const name = (r?.name ?? "").trim()
        if (!name) continue
        const c = Math.min(99, Number(r?.count ?? 0))
        map[name] = c
        if (c > 0) names.add(name)
      }

      setCounts(map)
      setCollected(names)
    } catch (e) {
      console.log("collections load error:", e)
      Alert.alert("Error", "Failed to load your collection.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // -------- data boot --------
  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        await loadCollections()
      } finally {
        if (fontsLoaded) SplashScreen.hideAsync()
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [fontsLoaded])

<<<<<<< HEAD
  // --- Optional sync if param changes while mounted (deep link/back nav)
  useEffect(() => {
    if (tabParamRaw === "Badges" || tabParamRaw === "Rocks") {
      setActiveTab(tabParamRaw as "Rocks" | "Badges")
    }
  }, [tabParamRaw])

  if (!fontsLoaded) return null

  const byType = (t: "igneous" | "sedimentary" | "metamorphic") =>
    (Object.keys(rockMeta) as RockClass[]).filter((k) => rockMeta[k].type === t).sort()

  const rockCategories: { title: string; rocks: (RockClass | null)[] }[] = [
    { title: "Igneous rocks", rocks: byType("igneous") },
    { title: "Sedimentary rocks", rocks: byType("sedimentary") },
    { title: "Metamorphic rocks", rocks: byType("metamorphic") },
  ].map(({ title, rocks }) => {
    const COLUMNS = 3
    const pad = (COLUMNS - (rocks.length % COLUMNS)) % COLUMNS
    return { title, rocks: [...rocks, ...Array(pad).fill(null)] }
  })

=======
  // lazy-load badges on first switch
  useEffect(() => {
    if (activeTab === "Badges" && badges.length === 0) loadBadges()
  }, [activeTab])

  if (!fontsLoaded) return null

  // -------- components --------
>>>>>>> origin/main
  const RockGrid = ({ rocks }: { rocks: (RockClass | null)[] }) => (
    <View style={styles.rockGrid}>
      {rocks.map((rock, index) => {
        const isPlaceholder = rock === null
<<<<<<< HEAD
=======
        const count = !isPlaceholder ? (counts[rock as string] ?? 0) : 0
        const isCollected = count > 0
        const displayCount = Math.min(99, count)

>>>>>>> origin/main
        return (
          <TouchableOpacity
            key={index}
            style={styles.rockItem}
            activeOpacity={isPlaceholder ? 1 : 0.8}
            onPress={() => {
              if (isPlaceholder) return
              router.push({
                pathname: "/(tabs)/players/collection-rock",
                params: { rockClass: rock as string },
              })
            }}
          >
<<<<<<< HEAD
            <View style={[styles.rockImage, isPlaceholder && styles.rockImagePlaceholder]}>
=======
            <View
              style={[
                styles.rockImage,
                isPlaceholder && styles.rockImagePlaceholder,
                !isPlaceholder && (isCollected ? styles.rockImageCollected : styles.rockImageLocked),
              ]}
            >
>>>>>>> origin/main
              {isPlaceholder ? (
                <Text style={styles.rockImageText}>?</Text>
              ) : (
                <>
                  <Image
                    source={rockImages[rock as RockClass]}
                    resizeMode="contain"
                    style={{ width: "90%", height: "70%" }}
                  />
                  <Text numberOfLines={1} style={styles.rockName}>
                    {rock}
                  </Text>
                  {isCollected && (
                    <View style={styles.badgeCountChip}>
                      <Text style={styles.badgeText}>{displayCount}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )

<<<<<<< HEAD
=======
  const BadgeGrid = () => (
    <View style={styles.badgeGrid}>
      {badges.map((b) => {
        const imgSrc = badgeImages[b.imageKey]
        const locked = !b.earned
        return (
          <View key={b.id} style={styles.badgeItem}>
            <View style={[styles.badgeCard, locked && styles.badgeCardLocked]}>
              <Image source={imgSrc} resizeMode="contain" style={{ width: "80%", height: "60%" }} />
              <Text style={styles.badgeName} numberOfLines={2}>
                {b.name}
              </Text>
              <Text style={styles.badgeProgress}>
                {Math.min(b.progress, b.threshold)}/{b.threshold}
              </Text>
              {locked && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={14} color="#111" />
                </View>
              )}
            </View>
          </View>
        )
      })}
    </View>
  )

  const byType = (t: "igneous" | "sedimentary" | "metamorphic") =>
    (Object.keys(rockMeta) as RockClass[]).filter((k) => rockMeta[k].type === t).sort()

  const rockCategories: { title: string; rocks: (RockClass | null)[] }[] = [
    { title: "Igneous rocks", rocks: byType("igneous") },
    { title: "Sedimentary rocks", rocks: byType("sedimentary") },
    { title: "Metamorphic rocks", rocks: byType("metamorphic") },
  ].map(({ title, rocks }) => {
    const COLUMNS = 3
    const pad = (COLUMNS - (rocks.length % COLUMNS)) % COLUMNS
    return { title, rocks: [...rocks, ...Array(pad).fill(null)] }
  })

  const handleRefresh = () => {
    setRefreshing(true)
    if (activeTab === "Badges") {
      loadBadges().finally(() => setRefreshing(false))
    } else {
      loadCollections()
    }
  }

>>>>>>> origin/main
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Collection</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/players/profile")} activeOpacity={0.9}>
            <Image source={avatarSrc} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={activeTab === "Rocks" ? cbg_rocks : cbg_badge}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {/* Tabs */}
          <View style={styles.fixedTabContainer}>
            {["Rocks", "Badges"].map((tab, i) => (
              <TouchableOpacity
                key={tab}
<<<<<<< HEAD
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabButtonActive,
                  i === 0 && { marginRight: 10 },
                ]}
=======
                style={[styles.tabButton, activeTab === tab && styles.tabButtonActive, i === 0 && { marginRight: 10 }]}
>>>>>>> origin/main
                onPress={() => setActiveTab(tab as "Rocks" | "Badges")}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          >
            {activeTab === "Rocks" ? (
              <View style={styles.rocksContent}>
                {loading ? (
                  <View style={{ paddingVertical: 40, alignItems: "center" }}>
                    <Text style={{ color: "#ffffffcc" }}>Loading collection…</Text>
                  </View>
                ) : (
                  rockCategories.map((category, index) => (
                    <View key={index} style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                      </View>
                      <RockGrid rocks={category.rocks} />
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View style={styles.badgesContent}>
                {badgesLoading ? (
                  <Text style={{ color: "#ffffffcc", textAlign: "center" }}>Loading badges…</Text>
                ) : badges.length === 0 ? (
                  <Text style={{ color: "#ffffffcc", textAlign: "center" }}>No badges yet.</Text>
                ) : (
                  <BadgeGrid />
                )}
              </View>
            )}
          </ScrollView>
        </ImageBackground>
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

const { width, height } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },

  fixedTabContainer: {
    position: "absolute",
<<<<<<< HEAD
    top: 157,
    left: 0,
    height: 40,
=======
    top: height * 0.18,
    left: 0,
    height: height * 0.06,
    width,
>>>>>>> origin/main
    flexDirection: "row",
    alignItems: "center",
    zIndex: 30,
    justifyContent: "flex-start",
  },

  tabButton: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    marginRight: 10,
    marginLeft: 0,
<<<<<<< HEAD
  },
  tabButtonActive: {
    backgroundColor: "#1f2937",
  },
  tabText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "white",
  },
  rockImagePlaceholder: {
    opacity: 0.25,
  },
  rockName: {
    color: "#1f2937",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  content: {
    flex: 1,
    marginTop: 200,
    overflow: "hidden",
  },
  rocksContent: {
    paddingHorizontal: 15,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffffff",
  },
  rockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  rockItem: {
    width: "32%",
    aspectRatio: 1,
    marginBottom: 12,
=======
>>>>>>> origin/main
  },
  tabButtonActive: { backgroundColor: "#1f2937" },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  tabTextActive: { color: "white" },

  content: { flex: 1, marginTop: 200, overflow: "hidden" },

  // Rocks
  rocksContent: { paddingHorizontal: 15 },
  categorySection: { marginBottom: 24 },
  categoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryTitle: { fontSize: 16, fontWeight: "600", color: "#ffffffff" },
  rockGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  rockItem: { width: "32%", aspectRatio: 1, marginBottom: 12 },
  rockImage: {
    flex: 1,
    backgroundColor: "#C0BAA9",
    borderRadius: 8,
    opacity: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  rockImageLocked: { opacity: 0.35 },
  rockImageCollected: { opacity: 1 },
  rockImagePlaceholder: { opacity: 0.25 },
  rockImageText: { color: "#6b7280", fontSize: 12 },
  rockName: { color: "#1f2937", fontSize: 12, fontWeight: "600", marginTop: 6 },

  // Header
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  title: { fontFamily: "PressStart2P_400Regular", fontSize: 20, color: "white", marginBottom: 8, marginTop: 20 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginTop: 10, borderWidth: 2, borderColor: "white" },

  // Badges
  badgesContent: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  badgeItem: { width: "32%", aspectRatio: 1, marginBottom: 12 },
  badgeCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
<<<<<<< HEAD
  comingSoon: {
    fontSize: 24,
    color: "#ffffffff",
    textAlign: "center",
    marginBottom: 0,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
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
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "white",
  },
=======
  badgeCardLocked: { opacity: 0.35 },
  badgeName: { fontSize: 12, fontWeight: "700", color: "#111", textAlign: "center", marginTop: 6 },
  badgeProgress: { fontSize: 11, color: "#374151", marginTop: 2 },
  lockOverlay: {
    position: "absolute",
    right: 6,
    top: 6,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 10,
    paddingHorizontal: 6,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Small count chip on rock tiles
  badgeCountChip: {
    position: "absolute",
    right: 6,
    top: 6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "black", fontSize: 11, fontWeight: "700" },
>>>>>>> origin/main
})
