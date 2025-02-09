import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TooltipHome = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐷 Home Tip: Track your expenses daily for better budgeting!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#222", padding: 12, borderRadius: 10, maxWidth: 250 },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default TooltipHome;
