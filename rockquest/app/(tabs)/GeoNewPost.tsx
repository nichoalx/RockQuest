"use client"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"

export default function NewPostScreen() {
  const router = useRouter()
  const [image, setImage] = useState(null)
  const [rockName, setRockName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [information, setInformation] = useState("")

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access media library is required!")
      }
    })()
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = () => {
    // You can extend this to save post data to a backend later
    router.replace("/(tabs)/GeoPosts")
  }

  return (
  <View style={styles.wrapper}>
    <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>RockQuest</Text>
        </View>
          <TouchableOpacity
            style={styles.profileIcon}
            onPress={() => router.replace("/(tabs)/GeoProfile")}
          > 
            <Ionicons name="person" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
        
      <Text style={styles.pageTitle}>New Post</Text>
      
      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image" size={32} color="#A77B4E" />
            <Text style={styles.placeholderText}>Pick an Image</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Inputs */}
      <Text style={styles.label}>Rock Name</Text>
      <TextInput
        style={styles.input}
        value={rockName}
        onChangeText={setRockName}
        placeholder="Enter rock name"
      />

      <Text style={styles.label}>Short Description</Text>
      <TextInput
        style={styles.input}
        value={shortDescription}
        onChangeText={setShortDescription}
        placeholder="Enter a short description"
      />

      <Text style={styles.label}>Information</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={information}
        onChangeText={setInformation}
        placeholder="Enter detailed information"
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Post</Text>
      </TouchableOpacity>

    {/* Bottom Navigation */}
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/(tabs)/GeoHomepage")}
      >
        <Ionicons name="home" size={24} color="#BA9B77" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/(tabs)/GeoPosts")}
      >
        <Ionicons name="chatbubbles" size={24} color="#BA9B77" />
        <Text style={styles.navText}>Posts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.replace("/(tabs)/auth")}
      >
        <Ionicons name="log-out" size={24} color="#BA9B77" />
        <Text style={styles.navText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  </View>
)
}

// CSS Style Sheet
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "white",
  },

    wrapper: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
  },

  scrollView: {
    flex: 1,
  },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10, 
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  titleWrapper: {
    justifyContent: "center",
    height: 40, 
  },

  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 16, 
    color: "#1f2937",
    marginTop: 0,
    marginBottom: 0,
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

  imagePicker: {
    marginBottom: 20,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },

  placeholder: {
    height: 200,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#6b7280",
    marginTop: 8,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#1f2937",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#A77B4E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
})

