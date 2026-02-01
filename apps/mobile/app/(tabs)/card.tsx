import { View, Text, StyleSheet } from "react-native";

export default function CardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Card</Text>
      <Text style={styles.subtext}>Card editor coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  subtext: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
});
