import React, { useEffect, useRef, useState } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getNearbyRocks } from "@/utils/playerApi";
import { rockImages, rockMeta, RockClass, isKnownClass } from "@/utils/rocks";

const { height } = Dimensions.get("window");

const darkTheme = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] },
];
const lightTheme: any[] = [];

// ----- types from API -----
type NearbyRock = {
  id: string;
  rockId?: string;
  lat: number;
  lng: number;
  confidence?: number;
  spawnedAt?: any;
  spawnedBy?: string;
  rockMeta?: { name?: string; imageUrl?: string; type?: string };
};

type NearbySummary = {
  uniques: RockClass[];
  byClass: Partial<Record<RockClass, number>>;
};

type Props = {
  onNearby?: (summary: NearbySummary) => void;
};

// ----- helpers -----
const JITTER_DEG = 0.0002; // ~22m; tweak as needed
const hashJitter = (id: string | number) => {
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) + ((h << 5) - h);
    h |= 0;
  }
  const norm = (n: number) => ((n % 1000) / 500) - 1; // [-1,1]
  const jx = norm(h);
  const jy = norm(h >> 1);
  return { dLat: jy * JITTER_DEG, dLng: jx * JITTER_DEG };
};

// radius (deg) that covers visible map; clamp to sane bounds
const radiusFromRegion = (r: Region) => {
  // half of the largest span, padded a bit so edges are included
  const base = Math.max(r.latitudeDelta, r.longitudeDelta) * 0.6;
  // clamp between ~500m and full city (~25km in deg ~= 0.25)
  const MIN = 0.005; // ~550m
  const MAX = 0.25;  // ~27km
  return Math.min(MAX, Math.max(MIN, base));
};

const MapComponent: React.FC<Props> = ({ onNearby }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [rocks, setRocks] = useState<NearbyRock[]>([]);
  const [selectedRock, setSelectedRock] = useState<{ name: string; description: string; image: any } | null>(null);
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const mapRef = useRef<MapView | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) get location and set initial camera
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location", "Permission to access location was denied.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const r: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setInitialRegion(r);
      setRegion(r);
    })();
  }, []);

  // 2) fetch by visible region (debounced)
  const fetchByRegion = async (r: Region) => {
    try {
      const radius = radiusFromRegion(r);
      const data = await getNearbyRocks(r.latitude, r.longitude, radius);
      const arr = Array.isArray(data) ? (data as NearbyRock[]) : [];
      setRocks(arr);

      if (onNearby) {
        const classes = arr
          .map((x) => (x.rockMeta?.name || "").toString())
          .filter(isKnownClass) as RockClass[];
        const byClass: Partial<Record<RockClass, number>> = {};
        for (const c of classes) byClass[c] = (byClass[c] ?? 0) + 1;
        const uniques = Array.from(new Set(classes));
        onNearby({ uniques, byClass });
      }
    } catch (e) {
      console.log("getNearbyRocks error:", e);
    }
  };

  // call on mount (initial region)
  useEffect(() => {
    if (region) fetchByRegion(region);
  }, [region?.latitude, region?.longitude, region?.latitudeDelta, region?.longitudeDelta]);

  const onRegionChangeComplete = (r: Region) => {
    // Debounce so we don’t refetch on every tiny camera tick while the user is panning
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setRegion(r);
      fetchByRegion(r);
    }, 300);
  };

  const handleMyLocationPress = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const next: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: region?.latitudeDelta ?? 0.02,
        longitudeDelta: region?.longitudeDelta ?? 0.02,
      };
      setRegion(next);
      mapRef.current?.animateToRegion(next, 550);
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  if (!initialRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A77B4E" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        loadingEnabled={false}
        moveOnMarkerPress={false}
        cacheEnabled
        mapType="standard"
        customMapStyle={isDark ? darkTheme : lightTheme}
      >
        {rocks.map((r, i) => {
          if (typeof r.lat !== "number" || typeof r.lng !== "number") return null;

          const label = (r.rockMeta?.name || "").toString();
          const known = isKnownClass(label);
          const img = known ? rockImages[label as RockClass] : null;

          // stable per-doc jitter so stacked points separate visually
          const { dLat, dLng } = hashJitter(r.id || i);
          const lat = r.lat + dLat;
          const lng = r.lng + dLng;

          return (
            <Marker
              key={r.id || i}
              coordinate={{ latitude: lat, longitude: lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => {
                const meta = known ? rockMeta[label as RockClass] : undefined;
                setSelectedRock({
                  name: known ? (label as RockClass) : label || "Unknown",
                  description: meta?.description ?? "No description available.",
                  image: img,
                });
              }}
            >
              <View style={styles.customMarker}>
                <View style={styles.markerImageWrapper}>
                  {img ? <Image source={img} style={styles.markerImage} /> : <Ionicons name="help" size={20} color="#A77B4E" />}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity
        onPress={handleMyLocationPress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Recenter map to my location"
        style={styles.myLocationButton}
      >
        <Ionicons name="navigate" size={20} color="#A77B4E" />
      </TouchableOpacity>

      {selectedRock && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedRock(null)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedRock(null)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              {selectedRock.image ? <Image source={selectedRock.image} style={styles.modalImage} /> : null}
              <Text style={styles.modalTitle}>{selectedRock.name}</Text>
              <Text style={styles.modalDesc}>{selectedRock.description}</Text>
              <TouchableOpacity onPress={() => setSelectedRock(null)} style={styles.closeButton}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: { height: "89%", width: "100%", overflow: "hidden" },
  map: { ...StyleSheet.absoluteFillObject },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  loadingText: { marginTop: 10, color: "#6b7280" },

  myLocationButton: {
    position: "absolute",
    right: 10,
    top: 150,
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  customMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#A77B4E",
    width: 50,
    height: 50,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerImageWrapper: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#C0BAA9" },
  markerImage: { width: 50, height: 40, resizeMode: "contain" },

  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    minHeight: height * 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, marginBottom: 20 },
  modalImage: { width: 150, height: 120, resizeMode: "contain", marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#1F2937" },
  modalDesc: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  closeButton: { backgroundColor: "#A77B4E", paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24, marginTop: "auto" },
  modalClose: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default MapComponent;
