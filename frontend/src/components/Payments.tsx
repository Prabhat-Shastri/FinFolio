import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const Payments: React.FC = () => {
  const incomingPayment = 500;
  const savingsAmount = 200;

  const handleScheduleSavings = () => {
    // Logic to schedule savings
    console.log(`Scheduled $${savingsAmount} to savings.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payments</Text>
      <Text style={styles.info}>You have an incoming payment of ${incomingPayment}.</Text>
      <Text style={styles.info}>You need to schedule ${savingsAmount} to send to savings.</Text>
      <Button title="Schedule Savings" onPress={handleScheduleSavings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default Payments; 