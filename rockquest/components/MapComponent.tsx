import React, { useEffect, useState } from 'react'
import MapView, { Marker, Region } from 'react-native-maps'
import * as Location from 'expo-location'
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native'

const { height } = Dimensions.get('window')

const MapComponent = () => {
  const [region, setRegion] = useState<Region | null>(null)
  const [selectedRock, setSelectedRock] = useState<{
    name: string
    description: string
    image: any
  } | null>(null)

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      })
    })()
  }, [])

  if (!region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A77B4E" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    )
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
          onPress={() =>
            setSelectedRock({
              name: 'Granite',
              description:
                'Granite is a coarse-grained igneous rock composed of quartz and feldspar. It forms from the slow crystallization of magma below Earth\'s surface.',
              image: require('../assets/images/rocks/Gneiss.png'),
            })
          }
        >
          <View style={styles.customMarker}>
            <View style={styles.markerImageWrapper}>
              <Image
                source={require('../assets/images/rocks/Gneiss.png')}
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

      {/* Rock Info Modal */}
      {selectedRock && (
        <Modal
          visible
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRock(null)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              activeOpacity={1} 
              onPress={() => setSelectedRock(null)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Image source={selectedRock.image} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedRock.name}</Text>
              <Text style={styles.modalDesc}>{selectedRock.description}</Text>
              <TouchableOpacity 
                onPress={() => setSelectedRock(null)} 
                style={styles.closeButton}
              >
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  mapContainer: {
    height: height * 0.65,
    width: '100%',
    overflow: 'hidden',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#A77B4E',
    width: 50,
    height: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerImageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C0BAA9',
  },
  markerImage: {
    width: 50,
    height: 40,
    resizeMode: 'contain',
  },
  markerText: {
    fontSize: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    minHeight: height * 0.5, // 50% of screen height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalImage: {
    width: 150,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  modalDesc: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  closeButton: {
    backgroundColor: '#A77B4E',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 'auto',
  },
  modalClose: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default MapComponent