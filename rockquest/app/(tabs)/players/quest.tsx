import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { router } from "expo-router"

SplashScreen.preventAutoHideAsync()

export default function QuestScreen() {
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Quest</Text>
            <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/profile")}>
              <Ionicons name="person" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Quest */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={20} color="#8B7355" />
            <Text style={styles.sectionTitle}>Today's Quest</Text>
          </View>
          <Text style={styles.sectionText}>Take pictures of 3 rocks</Text>
        </View>

        {/* Tasks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tasks</Text>
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
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/dashboard")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/camera")}>
          <Ionicons name="camera" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/collections")}>
          <MaterialIcons name="collections" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/posts")}>
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "#1f2937",
    marginTop: 20,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#6b7280",
  },
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
  taskText: {
    fontSize: 14,
    color: "#2C2C2C",
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999999",
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
})

