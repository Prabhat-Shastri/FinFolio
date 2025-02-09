import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ConnectBankScreen = () => {
  const banks = [
    "Chase",
    "Bank of America",
    "Wells Fargo",
    "Citibank",
    "Capital One",
    "US Bank",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Your Bank</Text>
        <Text style={styles.subtitle}>Choose your bank to connect your account</Text>
        
        {banks.map((bank, index) => (
          <TouchableOpacity key={index} style={styles.bankButton}>
            <Text style={styles.bankButtonText}>{bank}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#cccccc",
    marginBottom: 30,
    textAlign: "center",
  },
  bankButton: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  bankButtonText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default ConnectBankScreen;
