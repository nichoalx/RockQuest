"use client";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  Easing,
} from "react-native";
import { useFonts, PressStart2P_400Regular } from "@expo-google-fonts/press-start-2p";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapComponent from "../../../components/MapComponent";
import BottomNav from "@/components/BottomNav";
import { FIREBASE_AUTH } from "@/utils/firebase";
import { getProfile } from "@/utils/api";
import { avatarFromId } from "@/utils/avatar";

SplashScreen.preventAutoHideAsync();

const { width } = Dimensions.get("window");
const ROCKS_PANEL_HEIGHT = 170;
const ROCKS_HANDLE_WIDTH = 62;
const ROCKS_PANEL_WIDTH = width * 0.88; // 80% of screen width

export default function Dashboard() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({ PressStart2P_400Regular });
  const [loading, setLoading] = useState(true);
  const [showGreeting, setShowGreeting] = useState(true);
  const [avatarSrc, setAvatarSrc] = useState(avatarFromId(1));

  // sliding panel
  const [isMinimized, setIsMinimized] = useState(false);
  const slideX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const unsub = FIREBASE_AUTH.onAuthStateChanged(async (u) => {
      if (!u || !mounted) return;
      try {
        const data = await getProfile();
        if (!mounted) return;
        setAvatarSrc(avatarFromId(data?.avatarId));
      } catch (e) {
        console.log("getProfile error:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded && !loading) SplashScreen.hideAsync();
  }, [fontsLoaded, loading]);

  const togglePanel = () => {
    const minimized = !isMinimized;
    setIsMinimized(minimized);
    Animated.timing(slideX, {
      toValue: minimized ? -ROCKS_PANEL_WIDTH : 0, // Only slide the panel width minus handle
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  if (!fontsLoaded || loading) return null;

  const rockData = [
    { id: 1, name: "Granite" },
    { id: 2, name: "Quartz" },
    { id: 3, name: "Basalt" },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* MAP fills everything */}
      <View style={styles.mapWrapper}>
        <MapComponent />
      </View>


      <View style={styles.overlayLayer} pointerEvents="box-none">
        {/* top-right avatar */}
        <View style={styles.profileIconContainer} pointerEvents="box-none">
          <TouchableOpacity onPress={() => router.replace("/(tabs)/players/profile")} activeOpacity={0.85}>
            <Image source={avatarSrc} style={styles.profileImage} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        {showGreeting && (
          <View style={styles.greetingPanelContainer} pointerEvents="box-none">
            <TouchableOpacity style={styles.greetingPanel} onPress={() => setShowGreeting(false)} activeOpacity={0.9}>
              <View style={styles.greetingContent}>
                <View style={styles.greetingLeft}>
                  <View style={styles.greetingIcon}>
                    <Ionicons name="notifications" size={16} color="white" />
                  </View>
                  <View style={styles.greetingTextContainer}>
                    <Text style={styles.greetingTitle}>Hello, Player!</Text>
                    <Text style={styles.greetingDescription}>Check out the latest news</Text>
                  </View>
                </View>
                <Ionicons name="close" size={20} color="#A77B4E" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quest card */}
        <View style={[styles.questPanelContainer, { top: showGreeting ? 160 : 80 }]} pointerEvents="box-none">
          <TouchableOpacity style={styles.questPanel} onPress={() => router.push("/players/quest")} activeOpacity={0.9}>
            <View style={styles.questContent}>
              <View style={styles.questLeft}>
                <View style={styles.questIcon}>
                  <Ionicons name="location" size={16} color="white" />
                </View>
                <View style={styles.questTextContainer}>
                  <Text style={styles.questTitle}>Today's Quest</Text>
                  <Text style={styles.questDescription}>Take pictures of 3 rocks</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A77B4E" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sliding rocks container - separate from handle */}
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.rocksContainer,
            {
              transform: [{ translateX: slideX }],
            },
          ]}
        >
          {/* The main rocks panel - rounded rectangle */}
          <View style={styles.rocksPanel}>
            <View style={styles.rocksHeaderRow}>
              <Text style={styles.rocksSectionTitle}>Rocks Located...</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              <View style={styles.rocksScrollContainer}>
                {rockData.map((rock) => (
                  <TouchableOpacity key={rock.id} style={styles.rockCard} activeOpacity={0.85}>
                    <View style={styles.rockCardImage}>
                      <Text style={styles.rockCardText}>Rock</Text>
                    </View>
                    <Text style={styles.rockCardName}>{rock.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Handle - separate element positioned next to panel */}
          <TouchableOpacity style={styles.rocksHandle} onPress={togglePanel} activeOpacity={0.95}>
            <Ionicons name={isMinimized ? "chevron-forward" : "chevron-back"} size={18} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* BottomNav ABSOLUTE – does not push layout up */}
        <View style={styles.bottomNavWrapper} pointerEvents="box-none">
          <BottomNav
            items={[
              { label: "Home", route: "/(tabs)/players/dashboard", icon: { lib: "ion", name: "home" } },
              { label: "Scan", route: "/(tabs)/players/camera", icon: { lib: "ion", name: "camera" } },
              { label: "Collections", route: "/(tabs)/players/collections", icon: { lib: "mat", name: "collections" } },
              { label: "Posts", route: "/(tabs)/players/posts", icon: { lib: "ion", name: "chatbubbles" } },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f3f4f6" },

  mapWrapper: {
    flex: 1, // <-- map truly fills the screen behind overlays
  },

  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15, // shared layer for avatar, greeting, quest, rocks panel
  },

  // Avatar
  profileIconContainer: {
    position: "absolute",
    top: 87,
    right: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "white",
  },

  // Greeting
  greetingPanelContainer: {
    position: "absolute",
    top: 80,
    left: 16,
    right: 72,
  },
  greetingPanel: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  greetingContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greetingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  greetingIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  greetingTextContainer: { flex: 1 },
  greetingTitle: { fontSize: 14, color: "#1f2937", fontFamily: "PressStart2P_400Regular", marginBottom: 4 },
  greetingDescription: { fontSize: 12, color: "#6b7280" },

  // Quest
  questPanelContainer: {
    position: "absolute",
    left: 16,
    right: 72,
  },
  questPanel: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  questLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  questIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#A77B4E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questTextContainer: { flex: 1 },
  questTitle: { fontSize: 14, color: "#1f2937", fontFamily: "PressStart2P_400Regular", marginBottom: 4 },
  questDescription: { fontSize: 12, color: "#6b7280" },

  // Rocks container - holds both panel and handle
  rocksContainer: {
    position: "absolute",
    left: 0,
    bottom: 103, // hover above BottomNav
    height: ROCKS_PANEL_HEIGHT,
    width: ROCKS_PANEL_WIDTH + ROCKS_HANDLE_WIDTH, // Total width
    flexDirection: "row", // Panel and handle side by side
  },

  // The main rocks panel - rounded rectangle
  rocksPanel: {
    width: ROCKS_PANEL_WIDTH,
    height: ROCKS_PANEL_HEIGHT,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Handle - separate from panel
  rocksHandle: {
    width: ROCKS_HANDLE_WIDTH,
    height: ROCKS_PANEL_HEIGHT,
    backgroundColor: "#A77B4E",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  rocksHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rocksSectionTitle: {
    fontSize: 16,
    color: "#1f2937",
    fontFamily: "PressStart2P_400Regular",
    marginBottom: 10,
    marginTop: 6,
  },
  rocksScrollContainer: { flexDirection: "row", gap: 12, paddingRight: 8 },
  rockCard: { alignItems: "center" },
  rockCardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#C0BAA9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  rockCardText: { fontSize: 12, color: "#6b7280" },
  rockCardName: { fontSize: 12, color: "#374151", textAlign: "center" },

  // Bottom nav absolute so it doesn't push layout up
  bottomNavWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});