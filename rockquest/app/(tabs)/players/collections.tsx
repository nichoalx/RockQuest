"use client"

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
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import BottomNav from "@/components/BottomNav"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"
import { rockMeta, rockImages, RockClass } from "@/utils/rocks"
import { getMyRocks } from "@/utils/playerApi"


import cbg_rocks from "@/assets/images/cbg_rocks.png"
import cbg_badge from "@/assets/images/cbg_badges.png"

SplashScreen.preventAutoHideAsync()

export default function CollectionsScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("Rocks")
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))

  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setAvatarSrc(avatarFromId(data?.avatarId))

        // load user's collection
        const rocks = await getMyRocks()
        if (!mounted) return
        // backend returns each rock with `name` (e.g. "Basalt")
        const names = new Set<string>(rocks.map((r: { name: any }) => r.name).filter(Boolean) as string[])
        setCollected(names)
      } catch (e) {
        console.log("getProfile/getMyRocks error (collections):", e)
      } finally {
        if (fontsLoaded) SplashScreen.hideAsync()
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [fontsLoaded])


  if (!fontsLoaded) return null

  const byType = (t: "igneous" | "sedimentary" | "metamorphic") =>
    (Object.keys(rockMeta) as RockClass[])
      .filter((k) => rockMeta[k].type === t)
      .sort();

  const rockCategories: { title: string; rocks: (RockClass | null)[] }[] = [
    { title: "Igneous rocks",     rocks: byType("igneous")     },
    { title: "Sedimentary rocks", rocks: byType("sedimentary") },
    { title: "Metamorphic rocks", rocks: byType("metamorphic") },
  ].map(({ title, rocks }) => {
    // pad to full rows of 3 with null placeholders
    const COLUMNS = 3;
    const pad = (COLUMNS - (rocks.length % COLUMNS)) % COLUMNS;
    return { title, rocks: [...rocks, ...Array(pad).fill(null)] };
  })

const RockGrid = ({ rocks }: { rocks: (RockClass | null)[] }) => (
  <View style={styles.rockGrid}>
    {rocks.map((rock, index) => {
      const isPlaceholder = rock === null
      const isCollected = !isPlaceholder && collected.has(rock as string)
      return (
        <TouchableOpacity
          key={index}
          style={styles.rockItem}
          activeOpacity={isPlaceholder ? 1 : 0.8}
          onPress={() => {
            if (!isPlaceholder) router.push("/(tabs)/players/collection-rock")
          }}
        >
          <View
            style={[
              styles.rockImage,
              isPlaceholder && styles.rockImagePlaceholder,
              !isPlaceholder && (isCollected ? styles.rockImageCollected : styles.rockImageLocked),
            ]}
          >
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
              </>
            )}
          </View>
        </TouchableOpacity>
      )
    })}
  </View>
)
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

      {/* Scrollable Background & Content */}
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={activeTab === "Rocks" ? cbg_rocks : cbg_badge}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          {/* Fixed tabs on left side */}
          <View style={styles.fixedTabContainer}>
            {["Rocks", "Badges"].map((tab, i) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.tabButtonActive,
                  i === 0 && { marginRight: 10 },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}  // keep same visual start
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "Rocks" ? (
              <View style={styles.rocksContent}>
                {rockCategories.map((category, index) => (
                  <View key={index} style={styles.categorySection}>
                    <View style={styles.categoryHeader}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    </View>
                    <RockGrid rocks={category.rocks} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.badgesContent}>
                <Text style={styles.comingSoon}>Badges coming soon!</Text>
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
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    zIndex: 15,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
    marginTop: 37,
  },
  profileIcon: {
    position: "absolute",
    top: 143,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },

  fixedTabContainer: {
    position: "absolute",
    top: height*0.18,
    left: 0,                 // flush with left edge
    height: height *0.06,              // define button bar height
    width: width,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 30,
    justifyContent: "flex-start",
  },

  tabButton: {
    paddingHorizontal: 13,   // smaller buttons
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    marginRight: 10,
    marginLeft: 0,          
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
    marginTop: 200,          // clip starts just below the 40px filter bar
    overflow: "hidden",      // hide scrolled content above this edge
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
  },
  rockImage: {
    flex: 1,
    backgroundColor: "#C0BAA9",
    borderRadius: 8,
    opacity: 0.6,
    justifyContent: "center",
    alignItems: "center",
  },
  rockImageLocked: {
  opacity: 0.35,
  },
  rockImageCollected: {
  opacity: 1,
  },
  rockImageText: {
    color: "#6b7280",
    fontSize: 12,
  },
  badgesContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
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

})










