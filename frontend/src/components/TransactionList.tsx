import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Transaction {
  date: string;
  amount: number;
  merchant_name: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  // Take only the first 10 transactions
  const recentTransactions = transactions.slice(0, 10);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Transactions</Text>
      <ScrollView style={styles.scrollContainer}>
        {recentTransactions.map((item, index) => (
          <View key={`${item.date}-${index}`} style={styles.transactionItem}>
            <View style={styles.leftContent}>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.category}>{item.merchant_name}</Text>
            </View>
            <Text style={[
              styles.amount,
              { color: item.amount < 0 ? '#34C759' : '#FF3B30' }
            ]}>
              ${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    width: '100%',
  },
  scrollContainer: {
    maxHeight: 400, // This limits the height and enables scrolling
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  leftContent: {
    flex: 1,
  },
  date: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  category: {
    color: '#8E8E93',
    fontSize: 14,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TransactionList; 