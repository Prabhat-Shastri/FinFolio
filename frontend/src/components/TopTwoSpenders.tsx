import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface TopTwoSpendersProps {
  topSpender: string;
  top2Spender: string;
  topSpenderCount: number;
  top2SpenderCount: number;
}

const getCategoryIcon = (category: string): keyof typeof MaterialCommunityIcons.glyphMap => {
  const categoryMap: { [key: string]: keyof typeof MaterialCommunityIcons.glyphMap } = {
    'Food and Drink': 'food',
    'Travel': 'airplane',
    'Entertainment': 'movie',
    'Shopping': 'shopping',
    'Bills': 'file-document',
    'Transport': 'car',
    // Add more mappings as needed
  };

  return categoryMap[category] || 'help-circle'; // Default icon if category not found
};

const TopTwoSpenders: React.FC<TopTwoSpendersProps> = ({
  topSpender,
  top2Spender,
  topSpenderCount,
  top2SpenderCount,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Spending Categories</Text>
      
      <View style={styles.spenderItem}>
        <View style={styles.leftContent}>
          <MaterialCommunityIcons 
            name={getCategoryIcon(topSpender)} 
            size={24} 
            color="#34C759"
          />
          <Text style={styles.category}>{topSpender}</Text>
        </View>
        <Text style={styles.count}>{topSpenderCount} transactions</Text>
      </View>

      <View style={styles.spenderItem}>
        <View style={styles.leftContent}>
          <MaterialCommunityIcons 
            name={getCategoryIcon(top2Spender)} 
            size={24} 
            color="#FF9500"
          />
          <Text style={styles.category}>{top2Spender}</Text>
        </View>
        <Text style={styles.count}>{top2SpenderCount} transactions</Text>
      </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  spenderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  category: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  count: {
    color: '#8E8E93',
    fontSize: 14,
  },
});

export default TopTwoSpenders;
