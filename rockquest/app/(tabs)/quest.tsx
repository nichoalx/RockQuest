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
    { id: 9, text: "Change rock picture", completed: true },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>RockQuest</Text>
          <TouchableOpacity
            style={styles.profileIcon}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/profile")}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Subheading */}
        <Text style={styles.subtitle}>Quest</Text>

        {/* Today's Quest */}
        <View style={styles.questSection}>
          <View style={styles.questHeader}>
            <Ionicons name="calendar-outline" size={20} color="#8B7355" />
            <Text style={styles.questTitle}>Today's Quest</Text>
          </View>
          <Text style={styles.questDescription}>Take pictures of 3 rocks</Text>
        </View>

        {/* Tasks */}
        <View style={styles.tasksSection}>
          <Text style={styles.tasksTitle}>Tasks</Text>
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity style={styles.checkbox}>
                  {task.completed && <Ionicons name="checkmark" size={16} color="#BA9B77" />}
                </TouchableOpacity>
                <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>{task.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/dashboard")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/camera")}>
          <Ionicons name="camera" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/collections")}>
          <MaterialIcons name="collections" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Collections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.replace("/(tabs)/posts")}>
          <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
          <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    marginBottom: 0,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 18,
    color: "#2C2C2C",
  },
  subtitle: {
    fontSize: 16,
    color: "#8B7355",
    marginTop: 12,
    marginBottom: 16,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginLeft: 8,
  },
  questDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
  tasksSection: {
    flex: 1,
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 16,
  },
  tasksList: {
    flex: 1,
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
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 12,
    color: "#BA9B77",
    marginTop: 4,
    fontWeight: "500",
  },
  navTextActive: {
    color: "#A77B4E",
    fontWeight: "600",
  },
})
