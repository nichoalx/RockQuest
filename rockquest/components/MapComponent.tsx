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
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 add this

const { height, width } = Dimensions.get("window");

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

const MapComponent = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [selectedRock, setSelectedRock] = useState<{
    name: string;
    description: string;
    image: any;
  } | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const initialRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(initialRegion);
    })();
  }, []);

  const handleMyLocationPress = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      const nextRegion: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(nextRegion);
      mapRef.current?.animateToRegion(nextRegion, 550); // smooth recenter
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  if (!region) {
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
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false} 
        loadingEnabled={false}
        moveOnMarkerPress={false}
        cacheEnabled
        mapType="standard"
        customMapStyle={isDark ? darkTheme : lightTheme}
      >
        {/* example markers */}
        <Marker
          coordinate={{ latitude: region.latitude + 0.0005, longitude: region.longitude + 0.0005 }}
          onPress={() =>
            setSelectedRock({
              name: "Granite",
              description:
                "Granite is a coarse-grained igneous rock composed of quartz and feldspar. It forms from the slow crystallization of magma below Earth's surface.",
              image: require("../assets/images/rocks/Gneiss.png"),
            })
          }
        >
          <View style={styles.customMarker}>
            <View style={styles.markerImageWrapper}>
              <Image source={require("../assets/images/rocks/Gneiss.png")} style={styles.markerImage} />
            </View>
          </View>
        </Marker>

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

      {/* Rock Info Modal */}
      {selectedRock && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setSelectedRock(null)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSelectedRock(null)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Image source={selectedRock.image} style={styles.modalImage} />
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
  markerText: { fontSize: 20 },

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
