// collection-rock.tsx
"use client"

import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p'
import { useRouter } from 'expo-router'
import BottomNav from '@/components/BottomNav'
import { useLocalSearchParams } from 'expo-router'
import { rockMeta, rockImages, isKnownClass, RockClass } from "@/utils/rocks"

import rockinfo from '../../../assets/images/rockinfo.png'

export default function RockCollectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{rockClass: string}>()
  const rockClass = params.rockClass as RockClass

  const [fontsLoaded] = useFonts({ PressStart2P_400Regular })
  if (!fontsLoaded) return null

  if(!rockClass || !isKnownClass(rockClass)) {
    return (<Text style={{ color: "white", fontSize: 16 }}>Unknown rock</Text>)
  }
  const rockInfo = rockMeta[rockClass];
  const rockImage = rockImages[rockClass];

  return (
  <ImageBackground source={rockinfo} style={styles.background} imageStyle={styles.bgImage}>
    <StatusBar barStyle="dark-content" />

      {/* Header (fixed) */}
      <SafeAreaView style={styles.headerSafe}>
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
      </SafeAreaView>

      {/* Middle content area (non-scrollable, fixed height) */}
      <View style={styles.contentArea}>
        {/* Rock Image */}
        <View style={styles.imageContainer}>
          <Image
            source={rockImage}
            style={styles.rockImage}
            resizeMode="cover"
          />
        </View>

        {/* Rock Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Rock Information Loaded</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name: </Text>
            <Text style={styles.infoValue}>{rockClass}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type: </Text>
            <Text style={styles.infoValue}>{rockInfo.type}</Text>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.infoLabel}>About:</Text>
            <Text style={styles.aboutText} numberOfLines={6}>{rockInfo.description}</Text>
          </View>

          <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation (fixed) */}
      <View pointerEvents="box-none" style={styles.bottomNavWrap}>
        <BottomNav
          items={[
            { label: 'Home', route: '/(tabs)/players/dashboard', icon: { lib: 'ion', name: 'home' } },
            { label: 'Scan', route: '/(tabs)/players/camera', icon: { lib: 'ion', name: 'camera' } },
            { label: 'Collections', route: '/(tabs)/players/collections', icon: { lib: 'mat', name: 'collections' } },
            { label: 'Posts', route: '/(tabs)/players/posts', icon: { lib: 'ion', name: 'chatbubbles' } },
          ]}
        />
      </View>
    </ImageBackground>
  )

}

const HEADER_HEIGHT = 88;   // visual header height (including padding)
const BOTTOM_NAV_HEIGHT = 78;
const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000', // fallback if image fails
  },
  bgImage: {
    resizeMode: 'cover', // keep background from stretching oddly
  },

  /* Header (fixed) */
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    paddingTop: Platform.select({ ios: 8, android: 16 }),
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  headerContent: {
    height: HEADER_HEIGHT - 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    fontFamily: 'PressStart2P_400Regular',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A77B4E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Middle content (no scrolling) */
  contentArea: {
    flex: 1,
    paddingTop: HEADER_HEIGHT + 8,              // leave room for fixed header
    paddingBottom: BOTTOM_NAV_HEIGHT + 12,      // leave room for fixed bottom nav
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 24,
  },
  rockImage: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: 8,
  },

  infoContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 16,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 14,
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  infoValue: {
    color: '#ffffffff',
  },
  aboutSection: {
    marginTop: 6,
  },
  aboutText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffffff',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#d6d6d6ff',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  deleteButtonText: {
    color: '#d6d6d6ff',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Bottom nav (fixed) */
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: BOTTOM_NAV_HEIGHT,
    justifyContent: 'flex-end',
  },
})





