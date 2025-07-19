import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useRouter } from "expo-router"

export default function ChooseRoleScreen() {
  const router = useRouter()

  const handleRoleSelect = (role) => {
    router.push({ pathname: "/signup-details", params: { role } })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up as:</Text>
      <TouchableOpacity style={styles.button} onPress={() => handleRoleSelect("user")}>
        <Text style={styles.buttonText}>Player</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => handleRoleSelect("geologist")}>
        <Text style={styles.buttonText}>Geologist</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 40 },
  button: {
    backgroundColor: "#A77B4E",
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
})
