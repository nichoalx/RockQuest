import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ReviewItem {
  id: string;
  title: string;
  creator: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  location: string;
  type: 'Igneous' | 'Sedimentary' | 'Metamorphic' | 'Mineral' | 'Fossil';
  description?: string;
  dateCreated: string;
}

const GeoPosts = () => {
  const router = useRouter();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [modalVisible, setModalVisible] = useState(false);
  const [typeDropdownVisible, setTypeDropdownVisible] = useState(false);
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  
  const rockTypes = ['All Types', 'Igneous', 'Sedimentary', 'Metamorphic', 'Mineral', 'Fossil'];
  const statusOptions = ['All Status', 'Pending', 'Approved', 'Rejected'];

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: '1',
      title: 'Rock found in Clementi!',
      creator: 'Username',
      status: 'Pending',
      location: 'Clementi',
      type: 'Igneous',
      description: 'Found this interesting rock formation near the hiking trail. It appears to have unique mineral deposits.',
      dateCreated: '2024-01-15'
    },
    {
      id: '2',
      title: 'Rock found in Sentosa!',
      creator: 'Username',
      status: 'Approved',
      location: 'Sentosa',
      type: 'Sedimentary',
      description: 'Discovered during beach exploration. Shows signs of volcanic activity.',
      dateCreated: '2024-01-14'
    },
    {
      id: '3',
      title: 'Mineral sample from Bukit Timah',
      creator: 'GeoExplorer',
      status: 'Pending',
      location: 'Bukit Timah',
      type: 'Mineral',
      description: 'Unusual crystal formation found in the nature reserve.',
      dateCreated: '2024-01-13'
    },
    {
      id: '4',
      title: 'Metamorphic rock discovery',
      creator: 'RockHunter',
      status: 'Rejected',
      location: 'Jurong',
      type: 'Metamorphic',
      description: 'Found near construction site, shows interesting foliation patterns.',
      dateCreated: '2024-01-12'
    },
    {
      id: '5',
      title: 'Fossil specimen found',
      creator: 'PaleoFan',
      status: 'Approved',
      location: 'East Coast',
      type: 'Fossil',
      description: 'Ancient marine fossil embedded in limestone.',
      dateCreated: '2024-01-11'
    },
    {
      id: '6',
      title: 'Granite sample analysis',
      creator: 'GeoStudent',
      status: 'Pending',
      location: 'Pulau Ubin',
      type: 'Igneous',
      description: 'Large granite outcrop with visible quartz crystals.',
      dateCreated: '2024-01-10'
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FF9500';
      case 'Approved':
        return '#34C759';
      case 'Rejected':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return '#FFF3E0';
      case 'Approved':
        return '#E8F5E8';
      case 'Rejected':
        return '#FFEBEE';
      default:
        return '#F2F2F7';
    }
  };

  const handleReviewPress = (review: ReviewItem) => {
    setSelectedReview(review);
    setModalVisible(true);
  };

  const handleApprove = () => {
    if (selectedReview) {
      setReviews(prev => 
        prev.map(review => 
          review.id === selectedReview.id 
            ? { ...review, status: 'Approved' as const }
            : review
        )
      );
      setModalVisible(false);
      Alert.alert('Success', 'Review has been approved!');
    }
  };

  const handleReject = () => {
    if (selectedReview) {
      Alert.alert(
        'Confirm Rejection',
        'Are you sure you want to reject this review?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: () => {
              setReviews(prev => 
                prev.map(review => 
                  review.id === selectedReview.id 
                    ? { ...review, status: 'Rejected' as const }
                    : review
                )
              );
              setModalVisible(false);
              Alert.alert('Success', 'Review has been rejected.');
            }
          }
        ]
      );
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setTypeDropdownVisible(false);
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setStatusDropdownVisible(false);
  };

  const filteredReviews = reviews.filter(review => {
    const typeMatch = selectedType === 'All Types' || review.type === selectedType;
    const statusMatch = selectedStatus === 'All Status' || review.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const closeAllDropdowns = () => {
    setTypeDropdownVisible(false);
    setStatusDropdownVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Overlay to close dropdowns when tapping outside */}
      {(typeDropdownVisible || statusDropdownVisible) && (
        <TouchableOpacity 
          style={styles.overlay} 
          activeOpacity={1}
          onPress={closeAllDropdowns}
        />
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appTitle}>RockQuest</Text>
          <Text style={styles.greeting}>Hello Geologist</Text>
        </View>
        <TouchableOpacity
                  style={styles.profileIcon}
                  activeOpacity={0.8}
                  onPress={() => router.replace("/(tabs)/GeoProfile")}
                >
                  <Ionicons name="person" size={20} color="white" />
                </TouchableOpacity>
      </View>

      {/* Review Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Review Page</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {/* Type Filter */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, typeDropdownVisible && styles.filterButtonActive]}
            onPress={() => {
              setTypeDropdownVisible(!typeDropdownVisible);
              setStatusDropdownVisible(false);
            }}
          >
            <Text style={styles.filterText}>{selectedType}</Text>
            <Ionicons 
              name={typeDropdownVisible ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
          
          {typeDropdownVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {rockTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.dropdownItem,
                      selectedType === type && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedType === type && styles.dropdownItemTextSelected
                    ]}>
                      {type}
                    </Text>
                    {selectedType === type && (
                      <Ionicons name="checkmark" size={16} color="#BA9B77" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* Status Filter */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, statusDropdownVisible && styles.filterButtonActive]}
            onPress={() => {
              setStatusDropdownVisible(!statusDropdownVisible);
              setTypeDropdownVisible(false);
            }}
          >
            <Text style={styles.filterText}>{selectedStatus}</Text>
            <Ionicons 
              name={statusDropdownVisible ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#8E8E93" 
            />
          </TouchableOpacity>
          
          {statusDropdownVisible && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.dropdownItem,
                      selectedStatus === status && styles.dropdownItemSelected
                    ]}
                    onPress={() => handleStatusSelect(status)}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedStatus === status && styles.dropdownItemTextSelected
                    ]}>
                      {status}
                    </Text>
                    {selectedStatus === status && (
                      <Ionicons name="checkmark" size={16} color="#BA9B77" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Results Counter */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Review Items */}
      <ScrollView style={styles.reviewList} showsVerticalScrollIndicator={false}>
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateTitle}>No reviews found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters to see more results
            </Text>
          </View>
        ) : (
          filteredReviews.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.reviewItem}
              onPress={() => handleReviewPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.reviewContent}>
                <Text style={styles.reviewTitle}>{item.title}</Text>
                <Text style={styles.reviewCreator}>Created by: {item.creator}</Text>
                <Text style={styles.reviewType}>Type: {item.type}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusBackgroundColor(item.status) }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(item.status) }
                ]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Review Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Details</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {selectedReview && (
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalItemTitle}>{selectedReview.title}</Text>
                <Text style={styles.modalCreator}>Created by: {selectedReview.creator}</Text>
                <Text style={styles.modalDate}>Date: {selectedReview.dateCreated}</Text>
                <Text style={styles.modalLocation}>Location: {selectedReview.location}</Text>
                <Text style={styles.modalType}>Type: {selectedReview.type}</Text>
                
                {selectedReview.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{selectedReview.description}</Text>
                  </View>
                )}

                <View style={[
                  styles.currentStatusBadge,
                  { backgroundColor: getStatusBackgroundColor(selectedReview.status) }
                ]}>
                  <Text style={styles.currentStatusLabel}>Current Status:</Text>
                  <Text style={[
                    styles.currentStatusText,
                    { color: getStatusColor(selectedReview.status) }
                  ]}>
                    {selectedReview.status}
                  </Text>
                </View>

                {selectedReview.status === 'Pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={handleApprove}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={handleReject}
                    >
                      <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsLogoutModalVisible(false)}
              >
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
        <TouchableOpacity 
          style={styles.navItem} 
          activeOpacity={0.7} 
          onPress={() => router.replace("/(tabs)/GeoHomepage")}
        >
          <Ionicons name="home" size={24} color="#BA9B77" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
              
        <TouchableOpacity 
          style={styles.navItem} 
          activeOpacity={0.7} 
          onPress={() => router.replace("/(tabs)/GeoPosts")}
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
  );
};

// CSS stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
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
  pageHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    zIndex: 2,
  },
  dropdownContainer: {
    position: 'relative',
    flex: 1,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonActive: {
    borderColor: '#BA9B77',
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    maxHeight: 200,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownItemSelected: {
    backgroundColor: '#F8F8F8',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: '#BA9B77',
    fontWeight: '600',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  reviewList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  reviewCreator: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  reviewType: {
    fontSize: 12,
    color: '#BA9B77',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  modalCreator: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  modalDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  modalType: {
    fontSize: 14,
    color: '#BA9B77',
    fontWeight: '500',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1C1C1E',
    lineHeight: 20,
  },
  currentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  currentStatusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginRight: 8,
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    color: '#BA9B77',
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#A77B4E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  saveButtonText: { color: "white", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: { color: "#1f2937", fontWeight: "600" },
});

export default GeoPosts;