import { useRouter } from "expo-router"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

export default function ThankYouScreen() {
  const router = useRouter()

  const handleReturn = () => {
    router.replace("/auth") // or "/welcome" if you prefer starting over
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thank You!</Text>
      <Text style={styles.subtitle}>
        Your documents have been submitted. We'll review your application shortly.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleReturn}>
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#A77B4E",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#A77B4E",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})
