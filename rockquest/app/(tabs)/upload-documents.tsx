import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export default function UploadDocsScreen() {
  const router = useRouter();
  const { email, password, role, username, description } = useLocalSearchParams();
  const [document, setDocument] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [paramsChecked, setParamsChecked] = useState(false);

  useEffect(() => {
    console.log("UploadDocs params:", { email, password, role, username, description });

    if (!email || !password || !role || !username || !description) {
      Alert.alert("Missing Info", "Please start from the beginning.");
      router.replace("/welcomeScreen");
    } else {
      setParamsChecked(true);
    }
  }, [email, password, role, username, description]);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocument(result);
    }
  };

  const handleSubmit = () => {
    if (!document) {
      Alert.alert("Error", "Please upload a document");
      return;
    }

    Alert.alert("Submitted", "Your documents have been uploaded.", [
      {
        text: "OK",
        onPress: () => {
          router.replace("/thankyouScreen");
        },
      },
    ]);
  };

  const handleReturn = () => {
    router.replace("/welcomeScreen");
  };

  if (!paramsChecked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Checking info...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>

      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>
          {document && document.assets && document.assets.length > 0
            ? `Selected: ${document.assets[0].name}`
            : "Choose File"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
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

