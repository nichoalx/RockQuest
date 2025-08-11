import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { useRouter } from 'expo-router'
import BottomNav from '@/components/BottomNav'

export default function RockCollectionScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  if (!fontsLoaded) return null

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Rock Information</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.replace('/(tabs)/players/profile')}
          >
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Rock Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7AIjZLBZhVXMKHZ2lFgSHNtXUi6jqK.png',
            }}
            style={styles.rockImage}
            resizeMode="cover"
          />
        </View>

        {/* Rock Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Rock Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name: </Text>
            <Text style={styles.infoValue}>Granite</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type: </Text>
            <Text style={styles.infoValue}>Igneous</Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.infoLabel}>About:</Text>
            <Text style={styles.aboutText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua...
            </Text>
          </View>

          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        items={[
          {
            label: "Home",
            route: "/(tabs)/players/dashboard",
            icon: { lib: "ion", name: "home" },
          },
          {
            label: "Scan",
            route: "/(tabs)/players/camera",
            icon: { lib: "ion", name: "camera" },
          },
          {
            label: "Collections",
            route: "/(tabs)/players/collections",
            icon: { lib: "mat", name: "collections" },
          },
          {
            label: "Posts",
            route: "/(tabs)/players/posts",
            icon: { lib: "ion", name: "chatbubbles" },
          },
        ]}
      />
    </View>
  )
}

// CSS Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  returnText: {
    color: '#666',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e5e5e5',
  },
  activeFilter: {
    backgroundColor: 'black',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  rockImage: {
    width: 128,
    height: 128,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: '600',
  },
  infoValue: {
    color: '#333',
  },
  aboutSection: {
    marginTop: 4,
  },
  aboutText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#666',
    fontSize: 16,
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
});
