import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

const { height } = Dimensions.get('window');

const MapComponent = () => {
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

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
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        loadingEnabled
      >
    <Marker
      coordinate={{
        latitude: region.latitude + 0.0005,
        longitude: region.longitude + 0.0005,
      }}
      title="Granite"
      description="Igneous rock"
    >
      <View style={styles.customMarker}>
        <View style={styles.markerImageWrapper}>
          <Image
              source={require("../assets/images/GneissRock_Metamorphic.png")}
              style={styles.markerImage}
            />
        </View>
      </View>
    </Marker>

    <Marker
      coordinate={{
        latitude: region.latitude + 0.0003,
        longitude: region.longitude + 0.0007,
      }}
      title="Sandstone"
      description="Sedimentary rock"
    >
      <View style={styles.customMarker}>
        <View style={styles.markerImageWrapper}>
          <Text style={styles.markerText}>🪨</Text>
        </View>
      </View>
    </Marker>
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    height: height * 0.65, 
    width: '100%',
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    height: height * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
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

  markerImageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C0BAA9",
  },

  markerText: {
    fontSize: 20,
  },
  markerImage: {
    width: 50,
    height: 40,
    resizeMode: "contain", 
  },
});

export default MapComponent;
