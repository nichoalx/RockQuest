"use client"

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import BottomNav from "@/components/BottomNav"

import cbg_rocks from "../../../assets/images/cbg_rocks.png"
import cbg_badge from "../../../assets/images/cbg_badges.png"

SplashScreen.preventAutoHideAsync()

export default function CollectionsScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  const [activeTab, setActiveTab] = useState("Rocks")

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  const rockCategories = [
    { title: "Igneous rocks", rocks: Array(6).fill({ collected: true }) },
    { title: "Sedimentary rocks", rocks: Array(7).fill({ collected: true }) },
    { title: "Metamorphic rocks", rocks: Array(3).fill({ collected: true }) },
  ]

  const RockGrid = ({ rocks }: { rocks: any[] }) => (
    <View style={styles.rockGrid}>
      {rocks.map((rock, index) => (
        <TouchableOpacity
          key={index}
          style={styles.rockItem}
          onPress={() => router.push("/(tabs)/players/collection-rock")}
        >
          <View style={styles.rockImage}>
            <Text style={styles.rockImageText}>Rock</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Invisible Fixed Overlay */}
      <View style={styles.topOverlay} pointerEvents="box-none">
        <Text style={styles.overlayTitle}>Collection</Text>

        {/* Profile icon fixed on right */}
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={() => router.replace("/(tabs)/players/profile")}
        >
          <Ionicons name="person" size={20} color="white" />
        </TouchableOpacity>
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
            contentContainerStyle={{ paddingTop: 18, paddingBottom: 100 }}  // keep same visual start
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

      {/* Bottom Navigation */}
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
    top: 157,
    left: 0,                 // flush with left edge
    height: 40,              // define button bar height
    flexDirection: "row",
    alignItems: "center",
    zIndex: 30,
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
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
})










