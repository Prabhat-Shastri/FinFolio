import React from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Get screen width
const screenWidth = Dimensions.get("window").width;

const RedirectButtonComponent = ({ message }) => {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/payments");
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleRedirect}>
      <Text style={styles.buttonText}>{message || "Go to Payments"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFD700", // Yellow background
    padding: 15, // Padding around the text
    marginVertical: 10, // Vertical spacing
    width: screenWidth * 0.9, // Match the width of the calendar (90% of screen width)
    alignSelf: "center", // Center horizontally
    borderRadius: 8, // Rounded corners
    alignItems: "center", // Center text horizontally
    shadowColor: "#000", // Shadow effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // Android shadow effect
  },
  buttonText: {
    color: "#000000", // Black text for contrast
    fontSize: 16, // Font size
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "center", // Center text alignment
  },
});

export default RedirectButtonComponent; 