import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ImageBackground } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { router } from "expo-router"
import quest_bg from "../../../assets/images/quest_bg.png"

SplashScreen.preventAutoHideAsync()

export default function QuestScreen() {
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

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
      <View style={{ flex: 1 }}>
        <ImageBackground source={quest_bg} style={styles.bg} resizeMode="cover">
          {/* Fixed header + Today's Quest (do not scroll) */}
          <View style={styles.fixedOverlay} pointerEvents="box-none">
            {/* 👇 moved icon here and pinned to the very top-right */}
            <TouchableOpacity
              style={styles.profileIconTop}
              onPress={() => router.replace("/(tabs)/players/profile")}
            >
              <Ionicons name="person" size={20} color="white" />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.headerContent}>
                {/* Title removed */}
                {/* (icon was here previously) */}
              </View>
            </View>

            <View style={[styles.sectionCard, styles.fixedQuestCard]}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={20} color="#8B7355" />
                <Text style={styles.sectionTitle}>Today's Quest</Text>
              </View>
              <Text style={styles.sectionText}>Take pictures of 3 rocks</Text>
            </View>
          </View>

          {/* Fixed Tasks card (position does not change); its content scrolls inside */}
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

      {/* Bottom Navigation (fixed to absolute bottom) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/players/dashboard")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/players/camera")}>
          <Ionicons name="camera" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/players/collections")}>
          <MaterialIcons name="collections" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/players/posts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  bg: { flex: 1, width: "100%", height: "100%" },

  // Pinned area for header + Today's Quest
  fixedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // NEW: absolute at the very top-right (safe-area aware thanks to SafeAreaView)
  profileIconTop: {
    position: "absolute",
    top: 4,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
  },

  sectionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedQuestCard: {
    marginTop: 180,
    marginHorizontal: 20,
  },

  fixedTasksCard: {
    position: "absolute",
    left: 20,
    right: 20,
    top: 380,
    bottom: 50,
    zIndex: 9,
    overflow: "hidden",
  },

  tasksScroll: { flex: 1, marginTop: 8 },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#1f2937", marginLeft: 8 },
  sectionText: { fontSize: 14, color: "#6b7280" },

  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#BA9B77",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  taskText: { fontSize: 14, color: "#2C2C2C", flex: 1 },
  taskTextCompleted: { textDecorationLine: "line-through", color: "#999999" },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
})








