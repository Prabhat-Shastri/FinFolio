import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TooltipGoals = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐷 Goals Tip: Stay consistent and celebrate small wins!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#222", padding: 12, borderRadius: 10, maxWidth: 250 },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default TooltipGoals;
