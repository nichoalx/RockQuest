"use client"

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  RefreshControl,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import BottomNav from "@/components/BottomNav"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile, getMyPosts, getAllPosts, deletePost, reportPost, getFacts } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

export default function PostsScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  const [showMyPosts, setShowMyPosts] = useState(false)
  const [postTypeFilter, setPostTypeFilter] = useState("all")
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [posts, setPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadPosts = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser
      if (!user) return

      const [profileData, myPostsData, allPostsData, factsData] = await Promise.all([
        getProfile(), 
        getMyPosts(), 
        getAllPosts(),
        getFacts() // Add this to fetch facts
      ])

      setCurrentUser(user)
      setAvatarSrc(avatarFromId(profileData?.avatarId))

      // Process regular posts
      const allPosts = allPostsData.map((post) => ({
        ...post,
        isOwn: post.uploadedBy === user.uid,
        type: post.type || "post",
      }))

      // Process facts - assuming facts come from a different collection/endpoint
      const allFacts = factsData.map((fact) => ({
        ...fact,
        isOwn: fact.createdBy === user.uid || fact.uploadedBy === user.uid, // Adjust field name as needed
        type: "fact",
        // Map fact fields to match post structure
        rockName: fact.title,
        shortDescription: fact.description,
        description: fact.description,
        username: fact.username || "Admin", // Facts might not have usernames
      }))

      // Combine posts and facts
      const allContent = [...allPosts, ...allFacts]

      // Sort by creation date (most recent first)
      allContent.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB - dateA
      })

      // Filter out flagged content
      const visible = allContent.filter(item => !item.flagged)

      setPosts(visible)
    } catch (error) {
      console.log("Error loading posts:", error)
      Alert.alert("Error", "Failed to load posts")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadPosts()
  }

  const handleDeletePost = async (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(postId)
            // Reload posts after deletion
            loadPosts()
            Alert.alert("Success", "Post deleted successfully")
          } catch (error) {
            console.log("Delete error:", error)
            Alert.alert("Error", "Failed to delete post")
          }
        },
      },
    ])
  }

  const handleReportPost = async (postId) => {
    const reportReasons = [
      "Inappropriate content",
      "Spam or misleading",
      "Offensive language",
      "Incorrect information",
      "Copyright violation",
      "Other"
    ]

    Alert.alert(
      "Report Post",
      "Why are you reporting this post?",
      [
        { text: "Cancel", style: "cancel" },
        ...reportReasons.map(reason => ({
          text: reason,
          onPress: async () => {
            try {
              await reportPost(postId, reason)
              Alert.alert("Success", "Post reported successfully. Thank you for helping keep our community safe.")
            } catch (error) {
              console.log("Report error:", error)
              Alert.alert("Error", "Failed to report post. Please try again.")
            }
          }
        }))
      ],
      { cancelable: true }
    )
  }

  useEffect(() => {
    let mounted = true

    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return

      try {
        await loadPosts()
      } catch (e) {
        console.log("Auth state change error:", e)
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

  const filteredPosts = posts.filter((post) => {
    if (showMyPosts && !post.isOwn) return false
    if (postTypeFilter === "posts" && post.type !== "post") return false
    if (postTypeFilter === "facts" && post.type !== "fact") return false
    return true
  })

  const formatDate = (timestamp) => {
    if (!timestamp) return ""
    try {
      // Handle Firestore timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch (error) {
      return ""
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient colors={["#A77B4E", "#BA9B77", "#C0BAA9"]} style={styles.background}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
      </LinearGradient>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Posts</Text>
          <TouchableOpacity onPress={() => router.replace("/(tabs)/players/profile")} activeOpacity={0.9}>
            <Image source={avatarSrc} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>

        {/* Filter + Add */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.filterButton, showMyPosts && styles.filterButtonActive]}
            onPress={() => setShowMyPosts(!showMyPosts)}
          >
            <Text style={[styles.filterText, showMyPosts && styles.filterTextActive]}>My Posts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({ pathname: "/(tabs)/NewPost", params: { role: "player" } })}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Type filter row */}
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

      {/* Posts List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.postsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={32} color="#BA9B77" style={{ marginBottom: 12 }} />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#BA9B77" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>
                {showMyPosts ? "You haven't posted anything yet" : "No posts available"}
              </Text>
              <Text style={styles.emptySubtext}>
                {showMyPosts ? "Share your rock discoveries!" : "Be the first to share something!"}
              </Text>
            </View>
          ) : (
            filteredPosts.map((post) => (
              <View key={post.id} style={styles.postItem}>
                <View style={styles.postImage}>
                  {post.type === "fact" ? (
                    // Facts: Show a lightbulb icon instead of image
                    <View style={styles.factIconContainer}>
                      <Ionicons name="bulb" size={32} color="#A77B4E" />
                    </View>
                  ) : post.imageUrl ? (
                    // Posts: Show image if available
                    <Image source={{ uri: post.imageUrl }} style={styles.rockImage} resizeMode="cover" />
                  ) : (
                    // Posts: Show placeholder if no image
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image-outline" size={24} color="#A77B4E" />
                    </View>
                  )}
                </View>
                <View style={styles.postContent}>
                  <View style={styles.postHeader}>
                    <Text style={styles.postName}>{post.rockName || post.title || "Unnamed Rock"}</Text>
                    <View style={styles.postMeta}>
                      {post.type === "fact" && (
                        <View style={styles.factBadge}>
                          <Text style={styles.factBadgeText}>FACT</Text>
                        </View>
                      )}
                      <Ionicons name="information-circle-outline" size={16} color="#A77B4E" />
                    </View>
                  </View>
                  <Text style={styles.postDescription} numberOfLines={2}>
                    {post.shortDescription || post.description || "No description"}
                  </Text>
                  <Text style={styles.postUser}>
                    {post.isOwn ? "Posted by You" : `Posted by ${post.username || "User"}`}
                  </Text>
                  {post.createdAt && <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>}
                  
                  {/* Action buttons - show different buttons based on post type and ownership */}
                  <View style={styles.postActions}>
                    {post.type === "fact" ? (
                      // Facts: No action buttons (can't be reported or edited by users)
                      null
                    ) : post.isOwn ? (
                      // Own posts: Edit and Delete
                      <>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() =>
                            router.push({
                              pathname: "/(tabs)/NewPost",
                              params: { role: "player", editId: post.id },
                            })
                          }
                        >
                          <Ionicons name="pencil" size={12} color="#A77B4E" />
                          <Text style={styles.actionButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(post.id)}>
                          <Ionicons name="trash" size={12} color="#dc2626" />
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      // Other users' posts: Report
                      <TouchableOpacity style={styles.reportButton} onPress={() => handleReportPost(post.id)}>
                        <Ionicons name="flag" size={12} color="#f59e0b" />
                        <Text style={styles.reportButtonText}>Report</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

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
  container: { flex: 1 },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: 100,
    right: -30,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    top: 300,
    left: -20,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    bottom: 200,
    right: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 20,
    color: "#A77B4E",
    marginBottom: 8,
    marginTop: 20,
    textShadowColor: "rgba(167, 123, 78, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#A77B4E",
  },
  actionContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C0BAA9",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  filterButtonActive: { backgroundColor: "#A77B4E", borderColor: "#A77B4E" },
  filterText: { fontSize: 14, color: "#A77B4E", fontWeight: "500" },
  filterTextActive: { color: "white" },
  filterRowAligned: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  filterRightGroup: { flexDirection: "row", gap: 8, marginLeft: 12 },
  filterButtonEqual: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#C0BAA9",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  content: { flex: 1 },
  postsContainer: { padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 32,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#BA9B77",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 32,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#A77B4E",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BA9B77",
    textAlign: "center",
  },
  postItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(192, 186, 169, 0.3)",
  },
  postImage: {
    width: 70,
    height: 70,
    backgroundColor: "#CCCABC",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(167, 123, 78, 0.2)",
  },
  rockImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#CCCABC",
  },
  postContent: { flex: 1 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  factBadge: {
    backgroundColor: "#A77B4E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  factBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  postName: { fontSize: 16, fontWeight: "700", color: "#A77B4E", flex: 1 },
  postDescription: { fontSize: 14, color: "#6b5b47", marginBottom: 6, lineHeight: 20 },
  postUser: { fontSize: 13, color: "#BA9B77", marginBottom: 4, fontWeight: "500" },
  postDate: { fontSize: 12, color: "#C0BAA9", marginBottom: 12 },
  postActions: { flexDirection: "row", gap: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C0BAA9",
    backgroundColor: "rgba(167, 123, 78, 0.1)",
    gap: 4,
  },
  actionButtonText: { fontSize: 12, color: "#A77B4E", fontWeight: "600" },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fca5a5",
    backgroundColor: "rgba(220, 38, 38, 0.1)",
    gap: 4,
  },
  deleteButtonText: { fontSize: 12, color: "#dc2626", fontWeight: "600" },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fbbf24",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    gap: 4,
  },
  reportButtonText: { fontSize: 12, color: "#f59e0b", fontWeight: "600" },
  factIconContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(167, 123, 78, 0.1)",
    borderRadius: 12,
  },
})