import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';

interface ScheduleSavingsProps {
  currentBalance: number;
  onScheduleSavings: (amount: number) => void;
}

const ScheduleSavings: React.FC<ScheduleSavingsProps> = ({ currentBalance, onScheduleSavings }) => {
  const [savingsAmount, setSavingsAmount] = useState<number>(200);

  const handleScheduleSavings = () => {
    if (savingsAmount > 0 && savingsAmount <= currentBalance) {
      onScheduleSavings(savingsAmount);
      Alert.alert('Success', `Scheduled $${savingsAmount} to savings.`);
    } else {
      Alert.alert('Error', 'Invalid savings amount.');
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.info}>Schedule to Savings</Text>
      <TextInput
        style={styles.amountInput}
        value={savingsAmount.toString()}
        onChangeText={(text) => setSavingsAmount(Number(text))}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleScheduleSavings}>
        <Text style={styles.buttonText}>Schedule Savings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#444',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  info: {
    fontSize: 18,
    color: '#ddd',
    marginBottom: 10,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 5,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScheduleSavings; 