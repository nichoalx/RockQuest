"use client"
import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native"

SplashScreen.preventAutoHideAsync()

export default function PostsScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [showMyPosts, setShowMyPosts] = useState(false)
  const [postTypeFilter, setPostTypeFilter] = useState("all")
  const [showCreateOptions, setShowCreateOptions] = useState(false)

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const posts = [
    { id: 1, name: "Granite Sample", user: "You", isOwn: true, type: "post" },
    { id: 2, name: "Quartz Fact", user: "Username", isOwn: false, type: "fact" },
    { id: 3, name: "Basalt Rock", user: "Username", isOwn: false, type: "post" },
    { id: 4, name: "Limestone Fact", user: "You", isOwn: true, type: "fact" },
    { id: 5, name: "Obsidian", user: "Username", isOwn: false, type: "post" },
  ]

  const filteredPosts = posts.filter((post) => {
    if (showMyPosts && post.user !== "You") return false
    if (postTypeFilter === "posts" && post.type !== "post") return false
    if (postTypeFilter === "facts" && post.type !== "fact") return false
    return true
  })

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Posts</Text>
          <TouchableOpacity style={styles.profileIcon} onPress={() => router.replace("/(tabs)/GeoProfile")}>
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filter and Add */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.filterButton, showMyPosts && styles.filterButtonActive]}
            onPress={() => setShowMyPosts(!showMyPosts)}
          >
            <Text style={[styles.filterText, showMyPosts && styles.filterTextActive]}>My Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateOptions(true)}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Post Type Filter */}
        <View style={styles.filterRowAligned}>
          <TouchableOpacity
            style={[styles.filterButtonEqual, postTypeFilter === "all" && styles.filterButtonActive]}
            onPress={() => setPostTypeFilter("all")}
          >
            <Text style={[styles.filterText, postTypeFilter === "all" && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>

          <View style={styles.filterRightGroup}>
            <TouchableOpacity
              style={[styles.filterButtonEqual, postTypeFilter === "posts" && styles.filterButtonActive]}
              onPress={() => setPostTypeFilter("posts")}
            >
              <Text style={[styles.filterText, postTypeFilter === "posts" && styles.filterTextActive]}>Posts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButtonEqual, postTypeFilter === "facts" && styles.filterButtonActive]}
              onPress={() => setPostTypeFilter("facts")}
            >
              <Text style={[styles.filterText, postTypeFilter === "facts" && styles.filterTextActive]}>Facts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Posts */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.postsContainer}>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postItem}>
              <View style={styles.postImage}>
                <Text style={styles.postImageText}>Rock</Text>
              </View>
              <View style={styles.postContent}>
                <View style={styles.postHeader}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
                </View>
                <Text style={styles.postUser}>Submitted by {post.user}</Text>
                {post.isOwn && (
                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Modal */}
      {showCreateOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCreateOptions(false)
                router.push("/(tabs)/GeoNewPost")
              }}
            >
              <Text style={styles.modalButtonText}>New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCreateOptions(false)
                router.push("/(tabs)/GeoNewFact")
              }}
            >
              <Text style={styles.modalButtonText}>New Fact</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCreateOptions(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/GeoHomepage")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/GeoPosts")}>
          <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
          <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/auth")}>
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
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
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  filterButtonActive: {
    backgroundColor: "#1f2937",
    borderColor: "#1f2937",
  },
  filterText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
  },
  filterRowAligned: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  filterRightGroup: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 12,
  },
  filterButtonEqual: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d1d5db",
    minWidth: 70,
    alignItems: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  postsContainer: {
    padding: 20,
  },
  postItem: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postImage: {
    width: 60,
    height: 60,
    backgroundColor: "#C0BAA9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  postImageText: {
    color: "#6b7280",
    fontSize: 12,
  },
  postContent: {
    flex: 1,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  postName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  postUser: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  postActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  actionButtonText: {
    fontSize: 12,
    color: "#6b7280",
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
  },
  modalButtonText: {
    textAlign: "center",
    color: "#1f2937",
    fontSize: 16,
  },
  cancelText: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 14,
    textDecorationLine: "underline",
  },
})

