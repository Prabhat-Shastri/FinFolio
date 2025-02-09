import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image } from "react-native";

const ToolTip = ({ message }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Tooltip Button */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image 
          source={require("../../assets/images/pigicon.png")} 
          style={{ width: 50, height: 50 }} 
        />
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
            <Text style={styles.modalTitle}>App Tips</Text>
            <Text style={styles.modalText}>{message}</Text>
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
    backgroundColor: "#4CAF50", // Green background for tips
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  tooltipText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#333333",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#ffffff",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#d4d4d4",
    textAlign: "center",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#4CAF50",
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

export default ToolTip;
