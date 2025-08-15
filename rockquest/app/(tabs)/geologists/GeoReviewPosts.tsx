import React, { useEffect, useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  RefreshControl,
  Image, 
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { listReportedPosts, decideReport } from "@/utils/geoApi"

type UiStatus = "All Status" | "Pending" | "Approved" | "Rejected"

interface ReviewItem {
  id: string
  title: string
  creator: string
  status: "Pending" | "Approved" | "Rejected"
  location: string
  description?: string
  dateCreated: string
  reason?: string
  imageUrl?: string | null      // ← add this
  _raw?: any
}


const toUiStatus = (apiStatus?: string): ReviewItem["status"] => {
  if (!apiStatus) return "Pending"
  const s = String(apiStatus).toLowerCase()
  if (s === "approve") return "Approved"
  if (s === "reject") return "Rejected"
  return "Pending"
}

const formatDate = (ts: any) => {
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts || Date.now())
    return d.toLocaleDateString()
  } catch {
    return ""
  }
}

const mapReportToReviewItem = (r: any): ReviewItem => {
  const p = r?.post || {}
  return {
    id: r.reportId || r.id,
    title: p.rockName || p.title || `Post ${r.postId}`,
    creator: p.username || r.reportedBy || "User",
    status: toUiStatus(r.status),
    location: p.locationName || p.location?.name || p.city || "Unknown",
    description: p.shortDescription || p.description || r.reason || "No description",
    reason: r.reason,
    dateCreated: formatDate(r.reportedAt || p.createdAt),
    imageUrl: p.imageUrl || p.imageURL || p.photoUrl || p.photoURL || null, // ← add this
    _raw: r, // keep raw if you need other bits later
  }
}

const statusToApi = (s: UiStatus): "pending" | "approve" | "reject" | "all" => {
  if (s === "Pending") return "pending"
  if (s === "Approved") return "approve"
  if (s === "Rejected") return "reject"
  return "all"
}

const ReviewReportedPosts = () => {
  const router = useRouter()
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)

  const [selectedStatus, setSelectedStatus] = useState<UiStatus>("All Status")
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false)

  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [items, setItems] = useState<ReviewItem[]>([])
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null)

  const statusOptions: UiStatus[] = ["All Status", "Pending", "Approved", "Rejected"]

  const loadReports = async (status: UiStatus) => {
    try {
      setLoading(true)
      const apiStatus = statusToApi(status)
      let all: any[] = []

      if (apiStatus === "all") {
        const [p, a, r] = await Promise.all([
          listReportedPosts("pending"),
          listReportedPosts("approve"),
          listReportedPosts("reject"),
        ])
        all = [...(p || []), ...(a || []), ...(r || [])]
      } else {
        all = (await listReportedPosts(apiStatus)) || []
      }

      const mapped = all.map(mapReportToReviewItem)
      mapped.sort((A, B) => {
        const a = A._raw?.reportedAt?.toDate ? A._raw.reportedAt.toDate() : new Date(A._raw?.reportedAt || 0)
        const b = B._raw?.reportedAt?.toDate ? B._raw.reportedAt.toDate() : new Date(B._raw?.reportedAt || 0)
        return +b - +a
      })
      setItems(mapped)
    } catch (e) {
      console.log("loadReports error:", e)
      Alert.alert("Error", "Failed to load reports")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadReports(selectedStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus])

  const filtered = useMemo(() => items, [items])

  const onRefresh = () => {
    setRefreshing(true)
    loadReports(selectedStatus)
  }

  const openDetails = (review: ReviewItem) => setSelectedReview(review)
  const closeDetails = () => setSelectedReview(null)

  const getStatusColor = (status: ReviewItem["status"]) => {
    switch (status) {
      case "Pending":
        return "#FF9500"
      case "Approved":
        return "#16a34a"
      case "Rejected":
        return "#dc2626"
      default:
        return "#8E8E93"
    }
  }

  const getStatusBackgroundColor = (status: ReviewItem["status"]) => {
    switch (status) {
      case "Pending":
        return "#FFF3E0"
      case "Approved":
        return "rgba(22,163,74,0.1)"
      case "Rejected":
        return "rgba(220,38,38,0.1)"
      default:
        return "#F2F2F7"
    }
  }

  const approveSelected = async () => {
    if (!selectedReview) return
    try {
      await decideReport(selectedReview.id, "approve")
      closeDetails()
      Alert.alert("Approved", "Post has been flagged and hidden for players.")
      loadReports(selectedStatus)
    } catch (e) {
      console.log("approve error:", e)
      Alert.alert("Error", "Failed to approve report")
    }
  }

  const rejectSelected = async () => {
    if (!selectedReview) return
    Alert.alert("Confirm Rejection", "Are you sure you want to reject this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await decideReport(selectedReview.id, "reject")
            closeDetails()
            Alert.alert("Rejected", "Report dismissed.")
            loadReports(selectedStatus)
          } catch (e) {
            console.log("reject error:", e)
            Alert.alert("Error", "Failed to reject report")
          }
        },
      },
    ])
  }

  // --------- Detail fields (image, title, description, createdBy) ----------
  const detailsPost = selectedReview?._raw?.post || {}
  const detailsImage: string | undefined =
    detailsPost.imageUrl || detailsPost.imageURL || detailsPost.photoUrl || detailsPost.photoURL
  const detailsTitle: string =
    detailsPost.rockName || detailsPost.title || selectedReview?.title || "Untitled"
  const detailsDesc: string =
    detailsPost.shortDescription || detailsPost.description || selectedReview?.description || "No description"
  const detailsCreator: string = detailsPost.username || selectedReview?.creator || "User"

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />


      {/* Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Review Reported Posts</Text>
      </View>

      {/* Status Filter */}
      <View style={styles.filtersContainer}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={[styles.filterButton, statusDropdownVisible && styles.filterButtonActive]}
            onPress={() => setStatusDropdownVisible(!statusDropdownVisible)}
          >
            <Text style={styles.filterText}>{selectedStatus}</Text>
            <Ionicons name={statusDropdownVisible ? "chevron-up" : "chevron-down"} size={16} color="#8E8E93" />
          </TouchableOpacity>

          {statusDropdownVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {["All Status", "Pending", "Approved", "Rejected"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.dropdownItem, selectedStatus === status && styles.dropdownItemSelected]}
                    onPress={() => {
                      setSelectedStatus(status as UiStatus)
                      setStatusDropdownVisible(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        selectedStatus === status && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {status}
                    </Text>
                    {selectedStatus === status && <Ionicons name="checkmark" size={16} color="#BA9B77" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Results count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filtered.length} item{filtered.length === 1 ? "" : "s"} found
          {loading ? " (loading…)" : ""}
        </Text>
      </View>

      {/* List */}
      <ScrollView
        style={styles.reviewList}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>Loading…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No reviews found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your filters</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.reviewItem}
              onPress={() => openDetails(item)}
              activeOpacity={0.7}
            >
              <View style={styles.reviewContent}>
                <Text style={styles.reviewTitle}>{item.title}</Text>
                <Text style={styles.reviewCreator}>Created by: {item.creator}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(item.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={!!selectedReview}
        onRequestClose={() => setSelectedReview(null)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Details</Text>
              <TouchableOpacity onPress={() => setSelectedReview(null)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <ScrollView
                style={styles.modalBody}                   // ← no flex:1 here anymore
                contentContainerStyle={{ paddingBottom: 16 }}
                showsVerticalScrollIndicator={false}
              >
                {/* image */}
                {selectedReview.imageUrl ? (
                  <Image source={{ uri: selectedReview.imageUrl }} style={styles.detailImage} resizeMode="cover" />
                ) : (
                  <View style={styles.detailImagePlaceholder}>
                    <Ionicons name="image-outline" size={28} color="#A77B4E" />
                  </View>
                )}

                {/* title */}
                <Text style={styles.modalItemTitle}>{selectedReview.title}</Text>

                {/* created by */}
                <Text style={styles.modalCreator}>Created by: {selectedReview.creator}</Text>

                {/* description */}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Description</Text>
                  <Text style={styles.descriptionText}>{selectedReview.description}</Text>
                </View>

                {/* approve / reject */}
                {selectedReview.status === "Pending" && (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.inlineActionButton, { borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.1)" }]}
                      onPress={approveSelected}
                    >
                      <Ionicons name="checkmark" size={14} color="#16a34a" />
                      <Text style={[styles.inlineActionButtonText, { color: "#16a34a" }]}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.inlineActionButton, { borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.1)" }]}
                      onPress={rejectSelected}
                    >
                      <Ionicons name="close" size={14} color="#dc2626" />
                      <Text style={[styles.inlineActionButtonText, { color: "#dc2626" }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>


      {/* Bottom Nav */}
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

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => setIsLogoutModalVisible(true)}
        >
          <Ionicons name="log-out" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
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
  },
  pageHeader: { paddingHorizontal: 20, paddingVertical: 16 },
  pageTitle: { fontSize: 20, fontWeight: "600", color: "#1C1C1E", textAlign: "center" },

  filtersContainer: { flexDirection: "row", paddingHorizontal: 20, paddingBottom: 16, gap: 12, zIndex: 2 },
  dropdownContainer: { position: "relative", flex: 1 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  filterButtonActive: { borderColor: "#BA9B77", backgroundColor: "#FFFFFF" },
  filterText: { fontSize: 14, color: "#1C1C1E", flex: 1 },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    maxHeight: 200,
  },
  dropdownScroll: { maxHeight: 200 },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  dropdownItemSelected: { backgroundColor: "#F8F8F8" },
  dropdownItemText: { fontSize: 14, color: "#1C1C1E", flex: 1 },
  dropdownItemTextSelected: { color: "#BA9B77", fontWeight: "600" },

  resultsContainer: { paddingHorizontal: 20, paddingBottom: 8 },
  resultsText: { fontSize: 14, color: "#8E8E93", fontStyle: "italic" },

  reviewList: { flex: 1, paddingHorizontal: 20 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: "600", color: "#8E8E93", marginTop: 16, marginBottom: 8 },
  emptyStateText: { fontSize: 14, color: "#8E8E93", textAlign: "center", lineHeight: 20 },

  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  reviewContent: { flex: 1 },
  reviewTitle: { fontSize: 16, fontWeight: "600", color: "#1C1C1E", marginBottom: 4 },
  reviewCreator: { fontSize: 14, color: "#8E8E93" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#E5E5EA" },
  statusText: { fontSize: 12, fontWeight: "600" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: "90%",
    maxHeight: "80%",
    minHeight: 360,            // ← ensure body has space
  },
  detailImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#F2F2F7",
    marginBottom: 12,
  },
  detailImagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1C1C1E" },
  closeButton: { padding: 4 },
  modalBody: { flex: 1 },
  modalItemTitle: { fontSize: 18, fontWeight: "700", color: "#1C1C1E", marginBottom: 6 },
  modalCreator: { fontSize: 14, color: "#8E8E93", marginBottom: 10 },

  descriptionContainer: { marginBottom: 12 },
  descriptionLabel: { fontSize: 16, fontWeight: "600", color: "#1C1C1E", marginBottom: 6 },
  descriptionText: { fontSize: 14, color: "#1C1C1E", lineHeight: 20 },

  currentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#F2F2F7",
  },
  currentStatusLabel: { fontSize: 14, fontWeight: "600", color: "#1C1C1E", marginRight: 8 },
  currentStatusText: { fontSize: 14, fontWeight: "600" },

  actionButtonsRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  inlineActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  inlineActionButtonText: { fontSize: 14, fontWeight: "700" },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: { alignItems: "center", justifyContent: "center", paddingVertical: 4, minWidth: 60 },
  navText: { fontSize: 12, fontWeight: "500", marginTop: 4, textAlign: "center", color: "#BA9B77" },

  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  saveButton: { backgroundColor: "#A77B4E", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginLeft: 10 },
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: { backgroundColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
  detailImage: { width: "100%", height: 180, borderRadius: 10, backgroundColor: "#F2F2F7", marginBottom: 12 },
  detailImagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

})

export default ReviewReportedPosts
