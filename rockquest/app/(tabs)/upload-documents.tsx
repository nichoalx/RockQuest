import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { FIREBASE_AUTH, FIRESTORE, FIREBASE_DB } from "@/utils/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadDocsScreen() {
  const router = useRouter();
  const { email, password, type, username, description } = useLocalSearchParams();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !password || !type || !username || !description) {
      Alert.alert("Missing Info", "Please start from the beginning.");
      router.replace("/welcomeScreen");
    }
  }, [email, password, type, username, description]);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocument(result.assets[0]);
    }
  };

const handleSubmit = async () => {
  if (!document) {
    Alert.alert("Error", "Please upload a document");
    return;
  }

  if (!email || !password || !type) {
    Alert.alert("Error", "Missing required information");
    return;
  }

  setLoading(true);
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email as string, password as string);
    const uid = userCredential.user.uid;

    // 2. Upload document to Firebase Storage
    const response = await fetch(document.uri);
    const blob = await response.blob();
    const storageRef = ref(FIREBASE_DB, `geologist_docs/${uid}/${document.name}`);
    await uploadBytes(storageRef, blob);
    const docUrl = await getDownloadURL(storageRef);

    // 3. Create user in Firestore with correct schema
    const userData = {
      avatarId: 1, // default avatar
      createdAt: serverTimestamp(),
      description: "Pending geologist verification",
      dob: "1970-01-01",
      email: email,
      isActive: true,
      scanCount: 0,
      suspendedAt: null,
      type: "geologist",
      uid: uid,
      unsuspendedAt: null,
      updatedAt: serverTimestamp(),
      username: `geologist_${uid.substring(0, 6)}`,
      verified: false,
      documentUrl: docUrl
    };

    await setDoc(doc(FIRESTORE, "user", uid), userData);

    Alert.alert(
      "Submitted", 
      "Your documents have been uploaded and are pending verification.",
      [{
        text: "OK",
        onPress: () => router.replace("/thankyouScreen")
      }]
    );
  } catch (error: any) {
    console.error("Error during submission:", error);
    Alert.alert(
      "Error",
      error.message || "Failed to submit documents. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  const handleReturn = () => {
    router.replace("/welcomeScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>
          {document ? `Selected: ${document.name}` : "Choose File"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={handleReturn} disabled={loading}>
        <Text style={styles.returnButtonText}>Return</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
  uploadButton: {
    backgroundColor: "#BA9B77",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#A77B4E",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  returnButton: {
    backgroundColor: "#ccc",
    padding: 16,
    borderRadius: 8,
  },
  returnButtonText: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
  },
});