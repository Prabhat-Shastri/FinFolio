import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface GraphProps {
  data: Record<string, number>;
  title: string;
  color: string;
  category: 'all' | 'food' | 'entertainment' | 'travel';
  predictedValue: number;
}

const Graph: React.FC<GraphProps> = ({ data, title, color, category, predictedValue }) => {
  const [prediction, setPrediction] = useState<number>(0);
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 32;

  // Fetch prediction value
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch(`http://localhost:8000/get_${category}_predicted?username=user_good`);
        const result = await response.json();
        setPrediction(result || 0);
        console.log(`${category} prediction:`, result);
      } catch (error) {
        console.error(`Error fetching ${category} prediction:`, error);
      }
    };

    fetchPrediction();
  }, [category]);

  const chartData = {
    labels: [...Object.keys(data).map(date => date.split('-')[2]), '28'],
    datasets: [
      // Actual spending line
      {
        data: [...Object.values(data)],
        color: () => color,
        strokeWidth: 2
      },
      // Prediction line (origin to day 28)
      {
        data: [0, ...Array(Object.keys(data).length).fill(null), prediction],
        color: () => '#FFFFFF',
        strokeWidth: 1,
        withDots: false,  // Remove dots
        strokeDashArray: [5, 5]  // Make line dotted
      }
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#1e2923",
            backgroundGradientTo: "#08130d",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            strokeWidth: 2,
          }}
          bezier={false}  // Straight lines
          style={styles.chart}
          withInnerLines={true}
          withShadow={false}  // Disable shadow
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chart: {
    borderRadius: 16,
  },
});

export default Graph;
