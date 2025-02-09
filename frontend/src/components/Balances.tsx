// frontend/app/components/AccountBalances.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AccountBalancesProps {
  checkingBalance: number;
  savingsBalance: number;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ checkingBalance, savingsBalance }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Balances</Text>
      <View style={styles.balanceContainer}>
        <Text style={styles.label}>Checking:</Text>
        <Text style={styles.amount}>${checkingBalance}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.label}>Savings:</Text>
        <Text style={styles.amount}>${savingsBalance}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#444',
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ddd',
    marginBottom: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#ddd',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AccountBalances;