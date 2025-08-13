import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground, Image, StatusBar } from "react-native"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile } from "@/utils/api"
import { avatarFromId } from "@/utils/avatar"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { router } from "expo-router"
import quest_bg from "../../../assets/images/quest_bg.png"
import BottomNav from "@/components/BottomNav"

SplashScreen.preventAutoHideAsync()

export default function QuestScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))

  // 1) Hooks FIRST (no early return above this line)
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  useEffect(() => {
    let mounted = true
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      try {
        const data = await getProfile()
        if (!mounted) return
        setAvatarSrc(avatarFromId(data?.avatarId))
      } catch (e) {
        console.log("getProfile error (quest):", e)
      }
    })
    return () => {
      mounted = false
      unsub()
    }
  }, [])

  // 2) Early return AFTER all hooks
  if (!fontsLoaded) return null

  const tasks = [
    { id: 1, text: "Open camera function", completed: true },
    { id: 2, text: "", completed: false },
    { id: 3, text: "", completed: false },
    { id: 4, text: "", completed: false },
    { id: 5, text: "", completed: false },
    { id: 6, text: "", completed: false },
    { id: 7, text: "", completed: false },
    { id: 8, text: "Take picture of a rock", completed: true },
    { id: 9, text: "Change profile picture", completed: true },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={{ flex: 1 }}>
        <ImageBackground source={quest_bg} style={styles.bg} resizeMode="cover">

          {/* Fixed header + Today's Quest */}
          <View style={styles.fixedOverlay} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.profileIconTop}
              onPress={() => router.replace("/(tabs)/players/profile")}
              activeOpacity={0.9}
            >
              <Image source={avatarSrc} style={styles.headerAvatar} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.headerContent}>{/* title intentionally empty */}</View>
            </View>

            <View style={[styles.sectionCard, styles.fixedQuestCard]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={20} color="#8B7355" />
                <Text style={styles.sectionTitle}>Today's Quest</Text>
              </View>
              <Text style={styles.sectionText}>Take pictures of 3 rocks</Text>
            </View>
          </View>

          {/* Fixed Tasks card; inner content scrolls */}
          <View style={[styles.sectionCard, styles.fixedTasksCard]}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <ScrollView
              style={styles.tasksScroll}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={true}
            >
              {tasks.map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.checkbox}>
                    {task.completed && <Ionicons name="checkmark" size={14} color="#BA9B77" />}
                  </View>
                  <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                    {task.text || "Untitled task"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <BottomNav
          items={[
            { label: "Home", route: "/(tabs)/players/dashboard", icon: { lib: "ion", name: "home" } },
            { label: "Scan", route: "/(tabs)/players/camera", icon: { lib: "ion", name: "camera" } },
            { label: "Collections", route: "/(tabs)/players/collections", icon: { lib: "mat", name: "collections" } },
            { label: "Posts", route: "/(tabs)/players/posts", icon: { lib: "ion", name: "chatbubbles" } },
          ]}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  bg: { flex: 1, width: "100%", height: "100%" },

  fixedOverlay: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },

  profileIconTop: { position: "absolute", top: 4, right: 20, zIndex: 11 },

  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "white" },

  sectionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 45,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedQuestCard: { marginTop: 180, marginHorizontal: 20 },
  fixedTasksCard: { position: "absolute", left: 20, right: 20, top: 380, bottom: 50, zIndex: 9, overflow: "hidden" },

  tasksScroll: { flex: 1, marginTop: 8 },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginLeft: 8 },
  sectionText: { fontSize: 14, color: "#6b7280" },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: "#BA9B77",
    marginRight: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF",
  },
  taskText: { fontSize: 14, color: "#2C2C2C", flex: 1 },
  taskTextCompleted: { textDecorationLine: "line-through", color: "#999999" },

  bottomNav: {
    position: "absolute",
    left: 0, right: 0, bottom: 0, zIndex: 20,

  },
})
