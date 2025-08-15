"use client"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native"
import { addPost, editPost, getAllPosts } from "@/utils/userApi"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FIREBASE_DB as storage, FIREBASE_AUTH } from "@/utils/firebase";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NewPostScreen() {
  const router = useRouter()
  const { role = "geologist", editId } = useLocalSearchParams()
  
  const [image, setImage] = useState<string | null>(null)
  const [rockName, setRockName] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [information, setInformation] = useState("")
  const [postType, setPostType] = useState("post")
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const isEditing = !!editId

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access media library is required!")
      }
    })()

    if (isEditing) {
      loadPostForEdit()
    }
  }, [editId])

  const loadPostForEdit = async () => {
    try {
      setLoading(true)
      const posts = await getAllPosts()
      const post = posts.find(p => p.id === editId)
      
      if (post) {
        setEditMode(true)
        setRockName(post.rockName || post.title || "")
        setShortDescription(post.shortDescription || post.description || "")
        setInformation(post.information || post.details || "")
        setPostType(post.type || "post")
        setImage(post.imageUrl || null)
      }
    } catch (error) {
      console.log("Error loading post for edit:", error)
      Alert.alert("Error", "Failed to load post data")
    } finally {
      setLoading(false)
    }
  }

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

  async function uriToBlob(uri: string): Promise<Blob> {
    const res = await fetch(uri);
    return await res.blob();
  }

  async function uploadImageToFirebase(imageUri: string): Promise<string> {
    // if already remote (editing), skip upload
    if (!imageUri.startsWith("file://")) return imageUri;

    const uid = FIREBASE_AUTH.currentUser?.uid ?? "anon";
    const ts = Date.now();
    const path = `posts/${uid}/${ts}.jpg`;

    const storageRef = ref(storage, path);
    const blob = await uriToBlob(imageUri);

    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public,max-age=31536000",
    };

    const task = uploadBytesResumable(storageRef, blob, metadata);

    await new Promise<void>((resolve, reject) => {
      task.on("state_changed", undefined, reject, () => resolve());
    });

    const url = await getDownloadURL(storageRef);
    return url;
  }

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    const formData = new FormData()
    
    // Create file object for upload
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'post-image.jpg',
    } as any)
    
    formData.append('upload_preset', 'your_upload_preset') // Replace with your Cloudinary upload preset
    
    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const data = await response.json()
      return data.secure_url
    } catch (error) {
      console.log('Cloudinary upload error:', error)
      throw new Error('Failed to upload image')
    }
  }

  const handleSubmit = async () => {
    if (!rockName.trim()) { Alert.alert("Error", "Please enter a rock name"); return; }
    if (!shortDescription.trim()) { Alert.alert("Error", "Please enter a short description"); return; }

    try {
      setLoading(true);

      let imageUrl = image || "";

      if (image && image.startsWith("file://")) {
        try {
          imageUrl = await uploadImageToFirebase(image);
        } catch (err) {
          console.log("Firebase upload error:", err);
          Alert.alert("Warning", "Image upload failed, post will be created without image");
          imageUrl = "";
        }
      }

      const postData = {
        rockName: rockName.trim(),
        shortDescription: shortDescription.trim(),
        information: information.trim(),
        type: postType,
        imageUrl,
      };

      if (isEditing) {
        await editPost(editId as string, postData);
        Alert.alert("Success", "Post updated successfully");
      } else {
        await addPost(postData);
        Alert.alert("Success", "Post created successfully");
      }

      router.replace(`/(tabs)/${role === "player" ? "players/posts" : "geologistsGeoPosts"}` as any);
    } catch (error) {
      console.log("Submit error:", error);
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "create"} post`);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    router.replace(`/(tabs)/${role === "player" ? "players/posts" : "geologistsGeoPosts"}` as any)
  }

  const handleReset = () => {
    setRockName("")
    setShortDescription("")
    setInformation("")
    setImage(null)
    setPostType("post")
  }

  const confirmLogout = () => {
    setIsLogoutModalVisible(false)
    router.replace("/(tabs)/auth" as any)
  }

  if (loading && isEditing) {
    return (
      <View style={[styles.wrapper, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A77B4E" />
        <Text style={{ marginTop: 10, color: "#6b7280" }}>Loading post...</Text>
      </View>
    )
  }

return (
  <SafeAreaView style={styles.wrapper} edges={['top', 'left', 'right']}>
    {/* remove translucent to avoid overlay */}
    <StatusBar barStyle="dark-content" backgroundColor="transparent" />

    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 }) as number}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>RockQuest</Text>
            </View>
            <TouchableOpacity
              style={styles.profileIcon}
              onPress={() =>
                router.replace(
                  `/(tabs)/${role === "player" ? "players/profile" : "geologists/GeoProfile"}`
                )
              }
            >
              <Ionicons name="person" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.pageTitle}>{isEditing ? "Edit Post" : "New Post"}</Text>

        {/* Form */}
        <View style={styles.contentBox}>
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

          <Text style={styles.label}>Post Type</Text>
          <View style={styles.typeToggle}>
            {role === "player" ? (
              <TouchableOpacity
                style={[styles.typeButton, styles.typeButtonActive, { flex: 1 }]}
                onPress={() => setPostType("post")}
              >
                <Text style={styles.typeButtonTextActive}>Post</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.typeButton, postType === "post" && styles.typeButtonActive]}
                  onPress={() => setPostType("post")}
                >
                  <Text style={postType === "post" ? styles.typeButtonTextActive : styles.typeButtonText}>
                    Post
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeButton, postType === "fact" && styles.typeButtonActive]}
                  onPress={() => setPostType("fact")}
                >
                  <Text style={postType === "fact" ? styles.typeButtonTextActive : styles.typeButtonText}>
                    Fact
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

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
            numberOfLines={6}
            textAlignVertical="top"
            blurOnSubmit={false}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
              <Text style={styles.returnButtonText}>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? "Update Post" : "Submit Post"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* spacer so last field isn't behind nav */}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

      {/* Bottom Navigation Bar (Role-Based) */}
      {role === "player" ? (
        // PLAYER: use the same in-file nav bar as your Posts screen
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)/players/dashboard")}
          >
            <Ionicons name="home" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)/players/camera")}
          >
            <Ionicons name="camera" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)/players/collections")}
          >
            <Ionicons name="images" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Collections</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.replace("/(tabs)/players/posts")}
          >
            <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
            <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // GEOLOGIST: keep your existing bar
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoHomepage")}>
            <Ionicons name="home" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.replace("/(tabs)/geologists/GeoPosts")}>
            <Ionicons name="chatbubbles" size={24} color="#A77B4E" />
            <Text style={[styles.navText, styles.navTextActive]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => setIsLogoutModalVisible(true)}>
            <Ionicons name="log-out" size={24} color="#BA9B77" />
            <Text style={styles.navText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelBtn]}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmBtn]}
                onPress={confirmLogout}
              >
                <Text style={styles.confirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// CSS Stylesheet
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "white",
    position: "relative",
    paddingBottom: 90, // prevent content from being hidden behind bottom nav
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
  titleWrapper: {
    justifyContent: "center",
    height: 40,
  },
  title: {
    fontFamily: "PressStart2P_400Regular",
    fontSize: 16,
    color: "#1f2937",
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
  pageTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  contentBox: {
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
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
  postTypeContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#A77B4E",
    borderColor: "#A77B4E",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "white",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    marginLeft: 2,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  returnButton: {
    flex: 1,
    backgroundColor: "#777",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  returnButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#d1a054",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#A77B4E",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
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
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 20,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: "#e5e7eb",
  },
  confirmBtn: {
    backgroundColor: "#A77B4E",
  },
  cancelText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
  },
  typeToggle: {
  flexDirection: "row",
  backgroundColor: "#f3f4f6",
  borderRadius: 8,
  padding: 4,
  marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 110, // keep content above the absolute bottom nav
  },
})