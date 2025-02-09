import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TooltipExplore = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐷 Explore Tip: Look for new ways to save money!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#222", padding: 12, borderRadius: 10, maxWidth: 250 },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default TooltipExplore;
