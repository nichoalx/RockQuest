import { View, StyleSheet } from "react-native"
import StartScreen from "./(tabs)/index"

export default function Page() {
  return (
    <View style={styles.container}>
      <StartScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
