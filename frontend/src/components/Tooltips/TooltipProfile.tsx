import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TooltipProfile = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐷 Profile Tip: Keep your savings goals updated!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#222", padding: 12, borderRadius: 10, maxWidth: 250 },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default TooltipProfile;
