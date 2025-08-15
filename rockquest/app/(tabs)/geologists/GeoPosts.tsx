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
  Modal,
} from "react-native"
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { listReportedPosts, decideReport } from "@/utils/geoApi"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile, getMyPosts, getAllPosts, deletePost, reportPost, getFacts } from "@/utils/userApi"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

export default function PostsScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })

  const [showMyPosts, setShowMyPosts] = useState(false)
  const [postTypeFilter, setPostTypeFilter] = useState<"all" | "posts" | "facts">("all")
  const [showCreateOptions, setShowCreateOptions] = useState(false)
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)

  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // moderation tab state
  const [view, setView] = useState<"posts" | "reports">("posts")
  const [reports, setReports] = useState<any[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  const loadReports = async () => {
    try {
      setReportsLoading(true)
      const data = await listReportedPosts("pending")
      setReports(Array.isArray(data) ? data : [])
    } catch (e) {
      console.log("loadReports error:", e)
      Alert.alert("Error", "Failed to load reported posts")
    } finally {
      setReportsLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser
      if (!user) return

      const [profileData, _myPosts, allPostsData, factsData] = await Promise.all([
        getProfile(),
        getMyPosts(),
        getAllPosts(),
        getFacts(), // NEW: fetch facts
      ])

      setAvatarSrc(avatarFromId(profileData?.avatarId))

      // Normalize regular posts
      const normalizedPosts = (allPostsData || []).map((p: any) => ({
        ...p,
        isOwn: p.uploadedBy === user.uid,
        type: p.type || "post",
      }))

      // Normalize facts to match the card structure
      const normalizedFacts = (factsData || []).map((f: any) => ({
        id: f.id || f.factId,
        type: "fact",
        isOwn: f.createdBy === user.uid || f.uploadedBy === user.uid,
        rockName: f.title,
        title: f.title,
        shortDescription: f.description,
        description: f.description,
        username: f.username || "Geologist",
        createdAt: f.createdAt,
        flagged: f.flagged,
        verified: true, // optional: show facts as verified, tweak if you track this
      }))

      // Combine, hide flagged, and sort newest first
      const all = [...normalizedPosts, ...normalizedFacts]
        .filter((item) => !item.flagged)
        .sort((a, b) => {
          const aDate = a?.createdAt?.toDate ? a.createdAt.toDate() : new Date(a?.createdAt || 0)
          const bDate = b?.createdAt?.toDate ? b.createdAt.toDate() : new Date(b?.createdAt || 0)
          return +bDate - +aDate
        })

      setPosts(all)
    } catch (err) {
      console.log("Error loading posts:", err)
      Alert.alert("Error", "Failed to load posts")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    if (view === "reports") {
      loadReports().finally(() => setRefreshing(false))
    } else {
      loadPosts()
    }
  }

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(postId)
            await loadPosts()
            Alert.alert("Success", "Post deleted successfully")
          } catch (e) {
            console.log("Delete error:", e)
            Alert.alert("Error", "Failed to delete post")
          }
        },
      },
    ])
  }

  const handleReportPost = async (postId: string) => {
    const reportReasons = [
      "Inappropriate content",
      "Spam or misleading",
      "Offensive language",
      "Incorrect information",
      "Copyright violation",
      "Other",
    ]

    Alert.alert(
      "Report Post",
      "Why are you reporting this post?",
      [
        { text: "Cancel", style: "cancel" },
        ...reportReasons.map((reason) => ({
          text: reason,
          onPress: async () => {
            try {
              const res = await reportPost(postId, reason)
              const msg =
                res?.message?.toLowerCase?.().includes("already")
                  ? "You’ve already reported this post. Our team is reviewing it."
                  : "Post reported successfully. Thanks for helping keep things safe."
              Alert.alert("Report", msg)
            } catch (error) {
              console.log("Report error:", error)
              Alert.alert("Error", "Failed to report post. Please try again.")
            }
          },
        })),
      ],
      { cancelable: true },
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

  useEffect(() => {
    if (view === "reports") loadReports()
  }, [view])

  if (!fontsLoaded) return null

  const filteredPosts = posts.filter((post) => {
    if (showMyPosts && !post.isOwn) return false
    if (postTypeFilter === "posts" && post.type !== "post") return false
    if (postTypeFilter === "facts" && post.type !== "fact") return false
    return true
  })

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
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
          <TouchableOpacity
            style={styles.headerAvatarWrap}
            onPress={() => router.replace("/(tabs)/geologists/GeoProfile")}
            activeOpacity={0.9}
          >
            <Image source={avatarSrc} style={styles.headerAvatar} />
          </TouchableOpacity>
        </View>

        {/* Filter + Add */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.filterButton, showMyPosts && styles.filterButtonActive]}
            onPress={() => setShowMyPosts(!showMyPosts)}
          >
            <Text style={[styles.filterText, showMyPosts && styles.filterTextActive]}>Mine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateOptions(true)}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>



        {/* Type Filter Row — only for posts view */}
        {view === "posts" && (
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
        )}
      </View>

      {/* Body */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.postsContainer}>
          {view === "reports" ? (
            // ----------------- REPORTED TAB -----------------
            reportsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading reports…</Text>
              </View>
            ) : reports.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="flag" size={48} color="#BA9B77" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>No pending reports</Text>
                <Text style={styles.emptySubtext}>Great! Nothing needs review.</Text>
              </View>
            ) : (
              reports.map((r: any) => {
                const p = r.post || {}
                return (
                  <View key={r.reportId || r.id} style={styles.postItem}>
                    {/* thumbnail */}
                    <View style={styles.postImage}>
                      {p.imageUrl ? (
                        <Image source={{ uri: p.imageUrl }} style={styles.rockImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <Ionicons name="image-outline" size={24} color="#A77B4E" />
                        </View>
                      )}
                    </View>

                    <View style={styles.postContent}>
                      <View style={styles.postHeader}>
                        <Text style={styles.postName}>{p.rockName || p.title || `Post ${r.postId}`}</Text>
                        <View style={styles.postMeta}>
                          {p.flagged && (
                            <View style={[styles.factBadge, { backgroundColor: "#dc2626" }]}>
                              <Text style={styles.factBadgeText}>FLAGGED</Text>
                            </View>
                          )}
                          {p.verified && (
                            <View style={[styles.factBadge, { backgroundColor: "#16a34a" }]}>
                              <Text style={styles.factBadgeText}>VERIFIED</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Text style={styles.postDescription} numberOfLines={2}>
                        {p.shortDescription || p.description || "No description"}
                      </Text>
                      <Text style={styles.postUser}>Reason: {r.reason}</Text>

                      {/* Approve / Reject */}
                      <View style={[styles.postActions, { marginTop: 8 }]}>
                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.1)" }]}
                          onPress={async () => {
                            try {
                              await decideReport(r.reportId || r.id, "approve")
                              Alert.alert("Approved", "Post has been flagged and hidden for players.")
                              loadReports()
                            } catch (e) {
                              console.log("approve error:", e)
                              Alert.alert("Error", "Failed to approve report")
                            }
                          }}
                        >
                          <Ionicons name="checkmark" size={12} color="#16a34a" />
                          <Text style={[styles.actionButtonText, { color: "#16a34a" }]}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.1)" }]}
                          onPress={async () => {
                            try {
                              await decideReport(r.reportId || r.id, "reject")
                              Alert.alert("Rejected", "Report dismissed.")
                              loadReports()
                            } catch (e) {
                              console.log("reject error:", e)
                              Alert.alert("Error", "Failed to reject report")
                            }
                          }}
                        >
                          <Ionicons name="close" size={12} color="#dc2626" />
                          <Text style={[styles.actionButtonText, { color: "#dc2626" }]}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              })
            )
          ) : (
            // ----------------- POSTS TAB -----------------
            loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading posts...</Text>
              </View>
            ) : filteredPosts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#BA9B77" style={styles.emptyIcon} />
                <Text style={styles.emptyText}>{showMyPosts ? "You haven't posted anything yet" : "No posts available"}</Text>
                <Text style={styles.emptySubtext}>
                  {showMyPosts ? "Share your rock discoveries!" : "Be the first to share something!"}
                </Text>
              </View>
            ) : (
              filteredPosts.map((post: any) => (
                <View key={post.id} style={styles.postItem}>
                  <View style={styles.postImage}>
                    {post.type === "fact" ? (
                      <View style={styles.actionContainer}>
                        <Ionicons name="bulb" size={32} color="#A77B4E" />
                      </View>
                    ) : post.imageUrl ? (
                      <Image source={{ uri: post.imageUrl }} style={styles.rockImage} resizeMode="cover" />
                    ) : (
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
                        {post.flagged && (
                          <View style={[styles.factBadge, { backgroundColor: "#dc2626" }]}>
                            <Text style={styles.factBadgeText}>FLAGGED</Text>
                          </View>
                        )}
                        {post.verified && (
                          <View style={[styles.factBadge, { backgroundColor: "#16a34a" }]}>
                            <Text style={styles.factBadgeText}>VERIFIED</Text>
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

                    {/* Actions: facts have no actions; posts keep edit/delete or report */}
                    <View style={styles.postActions}>
                      {post.type === "fact" ? null : post.isOwn ? (
                        <>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() =>
                              router.push({
                                pathname: "/(tabs)/NewPost",
                                params: { role: "geologist", editId: post.id },
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
                        <TouchableOpacity style={styles.reportButton} onPress={() => handleReportPost(post.id)}>
                          <Ionicons name="flag" size={12} color="#f59e0b" />
                          <Text style={styles.reportButtonText}>Report</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))
            )
          )}
        </View>
      </ScrollView>

      {/* Create Modal */}
      {showCreateOptions && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Content</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCreateOptions(false)
                router.push({ pathname: "/(tabs)/NewPost", params: { role: "geologist" } })
              }}
            >
              <Ionicons name="chatbubble" size={20} color="#A77B4E" />
              <Text style={styles.modalButtonText}>New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowCreateOptions(false)
                router.push("/(tabs)/geologists/GeoNewFact")
              }}
            >
              <Ionicons name="bulb" size={20} color="#A77B4E" />
              <Text style={styles.modalButtonText}>New Fact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateOptions(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsLogoutModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => {
                  setIsLogoutModalVisible(false)
                  router.replace("/(tabs)/auth")
                }}
              >
                <Text style={styles.saveButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}>
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
          <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
          <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setIsLogoutModalVisible(true)}>
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  background: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  decorativeCircle1: { position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)", top: 100, right: -30 },
  decorativeCircle2: { position: "absolute", width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.08)", top: 300, left: -20 },
  decorativeCircle3: { position: "absolute", width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.06)", bottom: 200, right: 20 },

  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: "rgba(255, 255, 255, 0.95)", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontFamily: "PressStart2P_400Regular", fontSize: 20, color: "#A77B4E", marginBottom: 8, marginTop: 20, textShadowColor: "rgba(167, 123, 78, 0.3)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },

  headerAvatarWrap: { width: 40, height: 40, borderRadius: 20, marginTop: 10, overflow: "hidden", borderWidth: 2, borderColor: "#A77B4E" },
  headerAvatar: { width: "100%", height: "100%", borderRadius: 18 },

  actionContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#C0BAA9", backgroundColor: "rgba(255, 255, 255, 0.8)" },
  filterButtonActive: { backgroundColor: "#A77B4E", borderColor: "#A77B4E" },
  filterText: { fontSize: 14, color: "#A77B4E", fontWeight: "500" },
  filterTextActive: { color: "white" },

  filterRowAligned: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  filterRightGroup: { flexDirection: "row", gap: 8, marginLeft: 12 },
  filterButtonEqual: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#C0BAA9", backgroundColor: "rgba(255, 255, 255, 0.8)", minWidth: 70, alignItems: "center" },

  addButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#A77B4E", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },

  content: { flex: 1 },
  postsContainer: { padding: 20 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
  loadingText: { fontSize: 16, color: "#BA9B77", fontWeight: "500" },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50, backgroundColor: "rgba(255, 255, 255, 0.9)", borderRadius: 16, padding: 32, marginTop: 20 },
  emptyIcon: { marginBottom: 16 },
  emptyText: { fontSize: 16, color: "#A77B4E", textAlign: "center", fontWeight: "600", marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: "#BA9B77", textAlign: "center" },

  postItem: { flexDirection: "row", marginBottom: 16, backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, borderWidth: 1, borderColor: "rgba(192, 186, 169, 0.3)" },
  postImage: { width: 70, height: 70, backgroundColor: "#CCCABC", borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 16, overflow: "hidden", borderWidth: 1, borderColor: "rgba(167, 123, 78, 0.2)" },
  rockImage: { width: "100%", height: "100%" },
  placeholderImage: { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#CCCABC" },

  postContent: { flex: 1 },
  postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  factBadge: { backgroundColor: "#A77B4E", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  factBadgeText: { color: "white", fontSize: 10, fontWeight: "700" },

  postName: { fontSize: 16, fontWeight: "700", color: "#A77B4E", flex: 1 },
  postDescription: { fontSize: 14, color: "#6b5b47", marginBottom: 6, lineHeight: 20 },
  postUser: { fontSize: 13, color: "#BA9B77", marginBottom: 4, fontWeight: "500" },
  postDate: { fontSize: 12, color: "#C0BAA9", marginBottom: 12 },

  postActions: { flexDirection: "row", gap: 12 },
  actionButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#C0BAA9", backgroundColor: "rgba(167, 123, 78, 0.1)", gap: 4 },
  actionButtonText: { fontSize: 12, color: "#A77B4E", fontWeight: "600" },
  deleteButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#fca5a5", backgroundColor: "rgba(220, 38, 38, 0.1)", gap: 4 },
  deleteButtonText: { fontSize: 12, color: "#dc2626", fontWeight: "600" },
  reportButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "#fbbf24", backgroundColor: "rgba(245, 158, 11, 0.1)", gap: 4 },
  reportButtonText: { fontSize: 12, color: "#f59e0b", fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(167, 123, 78, 0)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "85%", backgroundColor: "white", borderRadius: 20, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, borderWidth: 1, borderColor: "rgba(167, 123, 78, 0.2)" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#A77B4E", marginBottom: 20, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: { backgroundColor: "#A77B4E", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flex: 1, marginLeft: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 },
  saveButtonText: { color: "white", fontWeight: "700", textAlign: "center" },
  cancelButton: { backgroundColor: "#CCCABC", paddingHorizontal: 0, paddingVertical: 12, borderRadius: 12, flex: 1, marginRight: 8, marginLeft: 8, marginBottom: 12 },
  cancelButtonText: { color: "#fffbf7ff", fontWeight: "600", textAlign: "center" },
  modalButton: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, backgroundColor: "rgba(167, 123, 78, 0.1)", borderRadius: 12, marginBottom: 12, width: "100%", borderWidth: 1, borderColor: "rgba(167, 123, 78, 0.2)", gap: 12 },
  modalButtonText: { color: "#A77B4E", fontSize: 16, fontWeight: "600" },
  cancelText: { marginTop: 10, color: "#BA9B77", fontSize: 14, textAlign: "center", fontWeight: "500" },

  bottomNav: { flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.95)", borderTopWidth: 1, borderTopColor: "rgba(192, 186, 169, 0.3)", paddingTop: 12, paddingBottom: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#BA9B77", fontWeight: "500" },
  navTextActive: { color: "#A77B4E", fontWeight: "700" },
})
