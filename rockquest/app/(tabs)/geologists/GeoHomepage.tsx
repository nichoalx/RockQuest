import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect, useState } from "react"
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  Image,
  RefreshControl
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { signOut } from "firebase/auth"
import { FIREBASE_AUTH } from "@/utils/firebase"
import { getProfile, getAnnouncements, getAllPosts, getFacts } from "@/utils/userApi"
import { listReportedPosts } from "@/utils/geoApi"
import { avatarFromId } from "@/utils/avatar"

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get("window")

type PinnedAnnouncement = {
  id?: string
  title?: string
  description?: string
  imageUrl?: string
  pinned?: boolean
}

type ActivityItem = {
  id: string
  type: 'post' | 'fact' | 'report_approved' | 'report_rejected'
  title: string
  date: Date
  icon: string
}

type Stats = {
  postsReviewed: number
  approved: number
  pending: number
}

export default function Dashboard() {
  const router = useRouter()
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  const [refreshing, setRefreshing] = useState(false)

  // avatar
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1))

  // announcement
  const [pinned, setPinned] = useState<PinnedAnnouncement | null>(null)

  // new states for dynamic data
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [stats, setStats] = useState<Stats>({ postsReviewed: 0, approved: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  
  const onRefresh = async () => {
  setRefreshing(true)
  try {
    await Promise.all([loadStats(), loadRecentActivity()])
    // optionally refresh the pinned announcement too
    const list = await getAnnouncements()
    const pin = Array.isArray(list) ? list.find((a: any) => a?.pinned) : null
    setPinned(
      pin ? { id: pin.id, title: pin.title, description: pin.description, imageUrl: pin.imageUrl, pinned: true } : null
    )
  } catch (e) {
    // no-op; your load functions already log
  } finally {
    setRefreshing(false)
  }
}

const loadStats = async () => {
  try {
    const user = FIREBASE_AUTH.currentUser
    if (!user) {
      console.log("❌ No current user in loadStats")
      return
    }
    console.log("👤 Current user ID:", user.uid)

    const pendingReports = await listReportedPosts("pending")
    const pendingCount = Array.isArray(pendingReports) ? pendingReports.length : 0

    const approvedReports = await listReportedPosts("approve")
    const rejectedReports = await listReportedPosts("reject")

    // Filter reports that were moderated by this user
    const filterByModerator = (reports) => {
      if (!Array.isArray(reports)) return []
      return reports.filter(report => {
        // Check if this report was moderated by current user
        const moderatedByCurrentUser = report.moderatedBy === user.uid || report.moderated_by === user.uid
        return moderatedByCurrentUser
      })
    }

    const userApprovedReports = filterByModerator(approvedReports)
    const userRejectedReports = filterByModerator(rejectedReports)
    
    const approvedCount = userApprovedReports.length
    const totalReviewedCount = userApprovedReports.length + userRejectedReports.length
    const finalStats = {
      postsReviewed: totalReviewedCount,
      approved: approvedCount,
      pending: pendingCount
    }
    setStats(finalStats)

  } catch (error) {
    console.error("❌ Error loading stats:", error)
    console.error("❌ Error details:", error.message)
    setStats({ postsReviewed: 0, approved: 0, pending: 0 })
  }
}

const loadRecentActivity = async () => {
  try {
    const user = FIREBASE_AUTH.currentUser
    if (!user) {
      console.log("❌ No current user in loadRecentActivity")
      return
    }

    const activities = []
    const [allPosts, allFacts] = await Promise.all([
      getAllPosts(),
      getFacts()
    ])
    // Add recent posts (last 5)
    if (Array.isArray(allPosts) && allPosts.length > 0) {
      const recentPosts = allPosts
        .sort((a, b) => {
          const aDate = a?.createdAt?.toDate ? a.createdAt.toDate() : new Date(a?.createdAt || 0)
          const bDate = b?.createdAt?.toDate ? b.createdAt.toDate() : new Date(b?.createdAt || 0)
          return +bDate - +aDate
        })
        .slice(0, 4)


      recentPosts.forEach(post => {
        const date = post?.createdAt?.toDate ? post.createdAt.toDate() : new Date(post?.createdAt || Date.now())
        activities.push({
          id: post.id,
          type: 'post',
          title: `New post: "${post.rockName || post.title || 'Unnamed Rock'}"`,
          date,
          icon: 'chatbubble'
        })
      })
    } else {
      console.log("📝 No posts found or invalid format")
    }

    // Add recent facts (last 3)
    if (Array.isArray(allFacts) && allFacts.length > 0) {
      const recentFacts = allFacts
        .sort((a, b) => {
          const aDate = a?.createdAt?.toDate ? a.createdAt.toDate() : new Date(a?.createdAt || 0)
          const bDate = b?.createdAt?.toDate ? b.createdAt.toDate() : new Date(b?.createdAt || 0)
          return +bDate - +aDate
        })
        .slice(0, 3)
      recentFacts.forEach(fact => {
        const date = fact?.createdAt?.toDate ? fact.createdAt.toDate() : new Date(fact?.createdAt || Date.now())
        activities.push({
          id: fact.id || fact.factId,
          type: 'fact',
          title: `New fact: "${fact.title || 'Geology Fact'}"`,
          date,
          icon: 'bulb'
        })
      })
    } else {
      console.log("💡 No facts found or invalid format")
    }


    // Get recent moderated reports using API instead of Firestore
    try {
      
      // Get all approved and rejected reports, then filter by moderator
      const [approvedReports, rejectedReports] = await Promise.all([
        listReportedPosts("approve"),
        listReportedPosts("reject")
      ])
      
      
      // Combine and filter reports moderated by current user
      const allModeratedReports = [
        ...(Array.isArray(approvedReports) ? approvedReports.map(r => ({...r, status: 'approve'})) : []),
        ...(Array.isArray(rejectedReports) ? rejectedReports.map(r => ({...r, status: 'reject'})) : [])
      ].filter(report => {
        return report.moderatedBy === user.uid || report.moderated_by === user.uid
      })
      
      
      // Sort by moderated date and take recent ones
      const recentModeratedReports = allModeratedReports
        .sort((a, b) => {
          const aDate = a?.moderatedAt?.toDate ? a.moderatedAt.toDate() : new Date(a?.moderatedAt || a?.moderated_at || 0)
          const bDate = b?.moderatedAt?.toDate ? b.moderatedAt.toDate() : new Date(b?.moderatedAt || b?.moderated_at || 0)
          return +bDate - +aDate
        })
        .slice(0, 5)

      recentModeratedReports.forEach(report => {
        const date = report?.moderatedAt?.toDate 
          ? report.moderatedAt.toDate() 
          : new Date(report?.moderatedAt || report?.moderated_at || Date.now())
        const isApproved = report.status === "approve"
        
        activities.push({
          id: report.reportId || report.id,
          type: isApproved ? 'report_approved' : 'report_rejected',
          title: isApproved 
            ? `Approved report for "${report.postId || 'post'}"`
            : `Rejected report for "${report.postId || 'post'}"`,
          date,
          icon: isApproved ? 'checkmark' : 'close'
        })
      })
      
    } catch (moderationError) {
      console.log("⚠️ Error loading recent moderation activity:", moderationError.message)
    }

    const sortedActivities = activities
      .sort((a, b) => +b.date - +a.date)
      .slice(0, 10)
    setRecentActivity(sortedActivities)
  } catch (error) {
    setRecentActivity([])
  }
}

  const formatActivityDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    let mounted = true

    // Load profile (avatar)
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return
      
      try {
        setLoading(true)
        const profile = await getProfile()
        
        if (!mounted) return
        setAvatarSrc(avatarFromId(profile?.avatarId))

        // Load stats and activity
        await Promise.all([
          loadStats(),
          loadRecentActivity()
        ])
        
      } catch (e) {
        console.error("❌ Auth state change error:", e)
        console.error("❌ Error message:", e.message)
      } finally {
        setLoading(false)
      }
    })

    // Load announcements
    ;(async () => {
      try {
        const list = await getAnnouncements()
        
        if (!mounted) return
        const pin = Array.isArray(list) ? list.find((a: any) => a?.pinned) : null
        
        setPinned(pin ? {
          id: pin.id, title: pin.title, description: pin.description, imageUrl: pin.imageUrl, pinned: true
        } : null)
      } catch (e) {
        console.error("❌ Announcements error:", e)
        console.error("❌ Error message:", e.message)
        setPinned(null)
      }
    })()

    return () => { 
      console.log("🔄 Dashboard cleanup")
      mounted = false
      unsub() 
    }
  }, [])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  const handleLogout = async () => {
    try {
      await signOut(FIREBASE_AUTH)
    } catch {}
    setIsLogoutModalVisible(false)
    router.replace("/(tabs)/auth")
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#A77B4E"]}      // Android spinner color
            tintColor="#A77B4E"       // iOS spinner color
          />
        }
      >
      <LinearGradient colors={["#CCCABC", "#C0BAA9", "#BA9B77"]} style={styles.backgroundGradient}>
        {/* Decorative background circles */}
        <View style={[styles.decorativeCircle, { top: 100, right: -50 }]} />
        <View style={[styles.decorativeCircle, { bottom: 200, left: -30, opacity: 0.3 }]} />
        <View style={[styles.decorativeCircle, { top: 300, left: width * 0.7, opacity: 0.2 }]} />
      </LinearGradient>

      <ScrollView style={styles.contentWrapper} showsVerticalScrollIndicator={false}>
        {/* Header with Announcement & Profile */}
        <View style={styles.headerContainer}>
          <View style={styles.greetingWrapper}>
            <View style={styles.greetingBanner}>
              {pinned ? (
                <TouchableOpacity activeOpacity={0.9}>
                  <View style={styles.greetingTextBlock}>
                    <Text style={styles.greetingTitle}>
                      {pinned.title || "Announcement"}
                    </Text>
                    {!!pinned.description && (
                      <Text style={styles.greetingSubtitle} numberOfLines={2}>
                        {pinned.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.greetingTextBlock}>
                  <Text style={styles.greetingTitle}>Welcome back!</Text>
                  <Text style={styles.greetingSubtitle}>No pinned announcements right now.</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileIcon}
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)/geologists/GeoProfile")}
          >
            <Image source={avatarSrc} style={{ width: 38, height: 38, borderRadius: 19 }} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Ionicons name="document-text" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>{stats.postsReviewed}</Text>
            <Text style={styles.statsLabel}>Posts Reviewed</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="checkmark-circle" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>{stats.approved}</Text>
            <Text style={styles.statsLabel}>Approved</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="time" size={24} color="#A77B4E" />
            <Text style={styles.statsNumber}>{stats.pending}</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
        </View>

        {/* Shortcuts */}
        <View style={styles.shortcutContainer}>
          <TouchableOpacity style={styles.shortcutButton} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
            <View style={styles.shortcutContent}>
              <Ionicons name="chatbubbles" size={20} color="#A77B4E" />
              <View style={styles.shortcutTextContainer}>
                <Text style={styles.shortcutText}>View Posts</Text>
                <Text style={styles.shortcutSubtext}>Browse community posts</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BA9B77" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutButton}
            onPress={() => router.replace("/(tabs)/geologists/GeoReviewPosts")}
          >
            <View style={styles.shortcutContent}>
              <Ionicons name="clipboard" size={20} color="#A77B4E" />
              <View style={styles.shortcutTextContainer}>
                <Text style={styles.shortcutText}>Review Posts</Text>
                <Text style={styles.shortcutSubtext}>Moderate submissions</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BA9B77" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            {loading ? (
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="hourglass" size={16} color="white" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Loading recent activity...</Text>
                  <Text style={styles.activityTime}>Please wait</Text>
                </View>
              </View>
            ) : recentActivity.length === 0 ? (
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="information-circle" size={16} color="white" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>No recent activity</Text>
                  <Text style={styles.activityTime}>Start by reviewing posts</Text>
                </View>
              </View>
            ) : (
              recentActivity.slice(0, 4).map((activity, index) => (
                <View key={activity.id + index} style={[
                  styles.activityItem,
                  index === Math.min(4, recentActivity.length - 1) && { borderBottomWidth: 0 }
                ]}>
                  <View style={styles.activityIcon}>
                    <Ionicons name={activity.icon as any} size={16} color="white" />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText} numberOfLines={1}>
                      {activity.title}
                    </Text>
                    <Text style={styles.activityTime}>
                      {formatActivityDate(activity.date)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}
        >
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}
        >
          <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => setIsLogoutModalVisible(true)}>
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Logout Confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
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
              <TouchableOpacity style={styles.saveButton} onPress={handleLogout}>
                <Text style={styles.saveButtonText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  )
}

// Styles remain the same as your original
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCCABC",
    position: "relative",
  },

  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  decorativeCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(167, 123, 78, 0.1)",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 16,
  },

  contentWrapper: {
    flex: 1,
    paddingBottom: 100,
  },

  greetingWrapper: { flex: 1, marginRight: 12 },

  greetingBanner: {
    backgroundColor: "#A77B4E",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },

  greetingTextBlock: { flexDirection: "column" },
  greetingTitle: {
    color: "white",
    fontSize: 12,
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 6,
  },
  greetingSubtitle: { color: "white", fontSize: 12 },

  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#A77B4E",
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },

  statsCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statsNumber: { fontSize: 20, fontWeight: "bold", color: "#A77B4E", marginTop: 8, marginBottom: 4 },
  statsLabel: { fontSize: 12, color: "#6b7280", textAlign: "center" },

  shortcutContainer: { marginTop: 24, paddingHorizontal: 16, gap: 12 },
  shortcutButton: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  shortcutContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  shortcutTextContainer: { flex: 1 },
  shortcutText: { color: "#1f2937", fontSize: 16, fontWeight: "600", marginBottom: 2 },
  shortcutSubtext: { color: "#6b7280", fontSize: 12 },

  activityContainer: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937", marginBottom: 12 },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: "#1f2937", marginBottom: 2 },
  activityTime: { fontSize: 12, color: "#6b7280" },

  bottomPadding: { height: 20 },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: { flex: 1, alignItems: "center", paddingVertical: 8 },
  navText: { fontSize: 12, marginTop: 4, color: "#6b7280" },
  navTextActive: { color: "#A77B4E" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1f2937", marginBottom: 12 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  saveButton: { backgroundColor: "#A77B4E", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: { backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
})
