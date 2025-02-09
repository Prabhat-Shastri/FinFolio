import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Progress from 'react-native-progress';

interface SpendingProgressProps {
  category: 'food' | 'entertainment' | 'travel';
  color: string;
}

const SpendingProgress: React.FC<SpendingProgressProps> = ({ category, color }) => {
  const [goal, setGoal] = useState<number>(0);
  const [spending, setSpending] = useState<number>(0);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await fetch(`http://localhost:8000/get_${category}_spending_goal?username=user_good`);
        const data = await response.json();
        // The API returns an object with the goal value
        const goalValue = data[`${category}_spending_goal`] || 0;
        console.log(`${category} goal:`, goalValue);
        setGoal(goalValue);
      } catch (error) {
        console.error(`Error fetching ${category} goal:`, error);
        setGoal(0);
      }
    };

    const fetchSpending = async () => {
      try {
        const response = await fetch(`http://localhost:8000/get_${category}_spending?username=user_good`);
        const data = await response.json();
        // The API returns an object with the spending value
        const spendingValue = data[`${category}_spending`] || 0;
        console.log(`${category} spending:`, spendingValue);
        setSpending(spendingValue);
      } catch (error) {
        console.error(`Error fetching ${category} spending:`, error);
        setSpending(0);
      }
    };

    fetchGoal();
    fetchSpending();
  }, [category]);

  // Calculate progress as a percentage (between 0 and 1)
  const progress = goal > 0 ? Math.min(spending / goal, 1) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {category.charAt(0).toUpperCase() + category.slice(1)} Spending
      </Text>
      <Progress.Bar 
        progress={progress} 
        width={200} 
        color={color}
        borderWidth={1}
        borderColor="#ccc"
        height={15}
      />
      <Text style={styles.text}>
        ${spending.toFixed(2)} / ${goal.toFixed(2)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF',
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default SpendingProgress; 