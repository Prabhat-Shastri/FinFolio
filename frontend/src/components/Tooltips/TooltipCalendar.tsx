import React from "react";
import { View, Text, StyleSheet } from "react-native";

const TooltipCalendar = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🐷 Calendar Tip: Set automatic savings reminders!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#222", padding: 12, borderRadius: 10, maxWidth: 250 },
  text: { color: "#fff", fontSize: 14, textAlign: "center" },
});

export default TooltipCalendar;
