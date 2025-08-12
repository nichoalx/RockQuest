"use client"
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import BottomNav from "@/components/BottomNav"

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
    {
      title: "Igneous rocks",
      rocks: Array(6).fill({ collected: true }),
    },
    {
      title: "Sedimentary rocks",
      rocks: Array(7).fill({ collected: true }),
    },
    {
      title: "Metamorphic rocks",
      rocks: Array(3).fill({ collected: true }),
    },
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Collection</Text>
          </View>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/players/profile")}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Rocks" && styles.tabButtonActive]}
            onPress={() => setActiveTab("Rocks")}
          >
            <Text style={[styles.tabText, activeTab === "Rocks" && styles.tabTextActive]}>Rocks</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "Badges" && styles.tabButtonActive]}
            onPress={() => setActiveTab("Badges")}
          >
            <Text style={[styles.tabText, activeTab === "Badges" && styles.tabTextActive]}>Badges</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "Rocks" ? (
          <View style={styles.rocksContent}>
            {rockCategories.map((category, index) => (
              <View key={index} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <View style={styles.categoryActions}>
                    <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                    <MaterialIcons name="filter-list" size={20} color="#6b7280" style={styles.filterIcon} />
                  </View>
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
    backgroundColor: "#f3f4f6",
  },
  header: {
    backgroundColor: "white",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: "#1f2937",
    fontWeight: "600",
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  tabButtonActive: {
    backgroundColor: "#1f2937",
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "white",
  },
  content: {
    flex: 1,
  },
  rocksContent: {
    padding: 20,
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
    color: "#1f2937",
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterIcon: {
    marginLeft: 8,
  },
  rockGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rockItem: {
    width: "31%",
    aspectRatio: 1,
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
