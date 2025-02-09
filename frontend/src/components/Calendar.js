import React, { useState } from "react";
import { View, Text, Modal, StyleSheet, Dimensions, TouchableOpacity, TextInput, Button } from "react-native";
import { Calendar } from "react-native-calendars";

// Get screen width
const screenWidth = Dimensions.get("window").width;

// Sample data for money flow
const moneyFlowData = {
  "2025-01-28": { name: "Paycheck", amount: 1000, type: "in" },
  "2025-02-10": { name: "Car Loan", amount: -650, type: "out" },
  "2025-02-11": { name: "Paycheck", amount: 1000, type: "in" },
  "2025-02-20": { name: "Rent", amount: -750, type: "out" },
};

const CalendarComponent = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addTransactionModalVisible, setAddTransactionModalVisible] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ date: "", amount: 0, type: "in", name: "" });

  const generateMarkedDates = () => {
    const markedDates = {};

    Object.keys(moneyFlowData).forEach((date) => {
      const data = moneyFlowData[date];
      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: data.type === "in" ? `rgba(0, 255, 0, ${Math.min(Math.abs(data.amount) / 500, 1)})` : `rgba(255, 0, 0, ${Math.min(Math.abs(data.amount) / 500, 1)})`,
          },
          text: {
            color: "#ffffff",
            fontWeight: "bold",
          },
        },
      };
    });

    return markedDates;
  };

  const markedDates = generateMarkedDates();

  const handleDayPress = (day) => {
    const dateInfo = moneyFlowData[day.dateString];
    if (dateInfo) {
      setSelectedDate({ date: day.dateString, ...dateInfo });
      setModalVisible(true);
    }
  };

  const handleAddTransaction = () => {
    if (newTransaction.date && newTransaction.amount && newTransaction.name) {
      moneyFlowData[newTransaction.date] = {
        amount: newTransaction.amount,
        type: newTransaction.amount > 0 ? "in" : "out",
        name: newTransaction.name,
      };
      setAddTransactionModalVisible(false);
    }
  };

  const handleRemoveTransaction = () => {
    if (selectedDate && selectedDate.date) {
      delete moneyFlowData[selectedDate.date];
      setSelectedDate(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setAddTransactionModalVisible(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>
      <Calendar
        current={new Date().toISOString().split("T")[0]}
        markingType={"custom"}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
            backgroundColor: "#2d2d2d", // Dark gray background
            calendarBackground: "#2d2d2d", // Dark gray calendar background
            textSectionTitleColor: "#ffffff",
            dayTextColor: "#d4d4d4",
            todayTextColor: "#00adf5",
            selectedDayBackgroundColor: "#444",
            selectedDayTextColor: "#ffffff",
            arrowColor: "#ffffff",
            monthTextColor: "#ffffff",
          }}
  
        style={{
          borderRadius: 10,
          width: screenWidth * 0.9, // 90% of screen width
          alignSelf: "center", // Center horizontally
          elevation: 5, // Shadow effect on Android
          shadowColor: "#000", // Shadow color on iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedDate ? (
              <>
                <Text style={styles.modalTitle}>Details for {selectedDate.date}</Text>
                <Text style={styles.modalText}>Name: {selectedDate.name}</Text>
                <Text style={styles.modalText}>
                  {selectedDate.type === "in"
                    ? `Money In: $${selectedDate.amount}`
                    : `Money Out: $${Math.abs(selectedDate.amount)}`}
                </Text>
                <Button title="Remove Transaction" onPress={handleRemoveTransaction} />
              </>
            ) : (
              <Text style={styles.modalText}>No Data</Text>
            )}
            <Text style={styles.closeButton} onPress={() => setModalVisible(false)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addTransactionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddTransactionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Transaction</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#d4d4d4"
              onChangeText={(text) => setNewTransaction({ ...newTransaction, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="#d4d4d4"
              onChangeText={(text) => setNewTransaction({ ...newTransaction, date: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              placeholderTextColor="#d4d4d4"
              keyboardType="numeric"
              onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: parseFloat(text) })}
            />
            <Button title="Add Transaction" onPress={handleAddTransaction} />
            <Text style={styles.closeButton} onPress={() => setAddTransactionModalVisible(false)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e1e",
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
    marginBottom: 10,
    color: "#ffffff",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#d4d4d4",
  },
  closeButton: {
    fontSize: 16,
    color: "#00adf5",
    fontWeight: "bold",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
  },
  addButton: {
    fontSize: 24,
    color: "#00adf5",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#444",
    color: "#ffffff",
    borderRadius: 5,
  },
});

export default CalendarComponent;
