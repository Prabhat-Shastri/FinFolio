import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from "react-native";

// Get screen width
const screenWidth = Dimensions.get("window").width;

const WarningComponent = ({ message, paymentInfo }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Warning Button */}
      <TouchableOpacity style={styles.container} onPress={() => setModalVisible(true)}>
        <Text style={styles.warningText}>{message || "Insufficient Funds!"}</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Spending Alert</Text>
            <Text style={styles.modalText}>
              Based on your average spending habits, you will not have enough funds to meet payment:
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Payment:</Text> {paymentInfo?.paymentName || "Payment X"}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Due Date:</Text> {paymentInfo?.dueDate || "Date Y"}
            </Text>
            <Text style={styles.modalText}>
              <Text style={styles.boldText}>Amount:</Text> ${paymentInfo?.amount || "Z"}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ff4d4d", // Bright red background for warning
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
  warningText: {
    color: "#ffffff", // White text for contrast
    fontSize: 16, // Font size
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "center", // Center text alignment
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent overlay
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#333333", // Dark gray for the modal box
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ffffff", // White text for modal title
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#d4d4d4", // Slightly lighter gray text
    textAlign: "center",
  },
  boldText: {
    fontWeight: "bold", // Bold text for key information
    color: "#ffffff",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#ff4d4d", // Match warning button color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default WarningComponent;
