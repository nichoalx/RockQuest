import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { useRouter } from 'expo-router'
import BottomNav from '@/components/BottomNav'

import rockinfo from "../../../assets/images/rockinfo.png"

export default function RockCollectionScreen() {
  const router = useRouter()
  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  })

  if (!fontsLoaded) return null

  return (
    <ImageBackground source={rockinfo} style={styles.background}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(tabs)/players/collections')}
            >
              <Ionicons name="arrow-back" size={20} color="#1f2937" />
            </TouchableOpacity>
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
          <Text style={styles.infoTitle}>Rock Information Loaded</Text>

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
          { label: "Home", route: "/(tabs)/players/dashboard", icon: { lib: "ion", name: "home" } },
          { label: "Scan", route: "/(tabs)/players/camera", icon: { lib: "ion", name: "camera" } },
          { label: "Collections", route: "/(tabs)/players/collections", icon: { lib: "mat", name: "collections" } },
          { label: "Posts", route: "/(tabs)/players/posts", icon: { lib: "ion", name: "chatbubbles" } },
        ]}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },

  /* Header */
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // local backdrop for readability
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
    marginTop: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 20,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Content */
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 40, // pushed lower as you requested
  },
  rockImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },

  /* Info panel with its own backdrop */
  infoContainer: {
    flex: 1, 
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: 5,
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
    color: '#d5d5d5ff',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d5d5d5ff',
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#d5d5d5ff',
    fontSize: 16,
  },
})


