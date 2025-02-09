import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import AccountBalances from '@/src/components/Balances';
import { useState, useEffect } from 'react';
import ScheduleSavings from '@/src/components/ScheduleSavings';
import ToolTip from '@/src/components/ToolTip';

const Payments: React.FC = () => {
  const incomingPayment = 1000;
  const [bankBalance, setBankBalance] = useState(1500);
  const [savingsBalance, setSavingsBalance] = useState(500); // Use useState for savingsBalance

  const handleScheduleSavings = async (amount: number) => {
    if (amount > 0 && amount <= bankBalance) {
      try {
        // Update local state
        setBankBalance(bankBalance - amount);
        setSavingsBalance(savingsBalance + amount);

        // Make API call to update savings balance
        const response = await fetch(`http://localhost:8000/set_savings_balance?username=user_good&balance=${savingsBalance + amount}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'user_good',
            amount: savingsBalance + amount,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to update savings balance on server: ${errorText}`);
        }

        console.log(`Scheduled $${amount} to savings and updated server.`);
      } catch (error) {
        console.error('Error updating savings balance:', error);
      }
    } else {
      console.error('Invalid savings amount');
    }
  };

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch(`http://localhost:8000/bank_balance?username=user_good`);
        const result = await response.json();
        setBankBalance(result.bank_balance); // Update state with fetched data
        console.log(result.bank_balance);
      } catch (error) {
        console.error('Error fetching bank balance:', error);
      }

      // Fetch savings balance
      try {
        const response = await fetch(`http://localhost:8000/savings_balance?username=user_good`);
        const result = await response.json();
        setSavingsBalance(result.savings_balance); // Update state with fetched data
        console.log(result.savings_balance);
      } catch (error) {
        console.error('Error fetching savings balance:', error);
      }
    };

    fetchPrediction();
  }, []);
  
  return (
    <View style={styles.container}>
        <View style={styles.tooltipContainer}>
        <ToolTip message="Savings Tip: Use the calendar to see your upcoming payments and set reminders!" />
      </View>
      <View style={styles.card}>
        <Text style={styles.info}>Incoming Payment</Text>
        <Text style={[styles.amount, styles.incomingAmount]}>${incomingPayment}</Text>
      </View>
      <AccountBalances checkingBalance={bankBalance} savingsBalance={savingsBalance} />
      <ScheduleSavings
        currentBalance={bankBalance}
        onScheduleSavings={handleScheduleSavings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: "#121212", // Dark mode background
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#fff',
  },
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
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  incomingAmount: {
    color: '#4CAF50',
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
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
  },
});

export default Payments; 