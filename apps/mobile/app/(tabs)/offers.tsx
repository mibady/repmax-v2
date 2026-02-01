import { View, Text, StyleSheet } from "react-native";

export default function OffersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Offers</Text>
      <Text style={styles.subtext}>Track your college offers</Text>
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
