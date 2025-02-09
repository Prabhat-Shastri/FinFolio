import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import React, { useState } from "react";

const SpendingChart = () => {
  const screenWidth = Dimensions.get("window").width;

  // Hard-coded datasets for each category
  const datasets = {
    All: [50, 30, 20, 100, 40],
    Food: [20, 15, 25, 30, 20],
    Transport: [10, 40, 15, 25, 35],
    Shopping: [50, 20, 40, 70, 60],
    Entertainment: [30, 50, 60, 40, 35],
    School: [5, 10, 15, 10, 20],
    Utilities: [40, 30, 50, 60, 55],
    Travel: [80, 90, 70, 100, 95],
    Other: [15, 25, 20, 30, 25],
  };

  // State to manage selected dataset
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [spendingData, setSpendingData] = useState(datasets.All);

  // Function to calculate linear regression
  // const calculateTrendLine = (data) => {
  //   const n = data.length;
  //   const x = Array.from({ length: n }, (_, i) => i + 1); // X-coordinates (1, 2, 3, ...)
  //   const y = data;

  //   const sumX = x.reduce((acc, val) => acc + val, 0);
  //   const sumY = y.reduce((acc, val) => acc + val, 0);
  //   const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
  //   const sumX2 = x.reduce((acc, val) => acc + val * val, 0);

  //   const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  //   const intercept = (sumY - slope * sumX) / n;

  //   // Generate trend line data points
  //   return x.map((xi) => slope * xi + intercept);
  // };

  // // Calculate trend line for current spending data
  // const trendLineData = calculateTrendLine(spendingData);

  return (
    <View style={styles.container}>
      {/* Horizontal Scrollable Button Group */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.buttonScrollContainer}
      >
        {Object.keys(datasets).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.button,
              selectedCategory === category && styles.selectedButton,
            ]}
            onPress={() => {
              setSelectedCategory(category);
              setSpendingData(datasets[category]);
            }}
          >
            <Text style={styles.buttonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Line Chart */}
      <LineChart
        data={{
          labels: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5"],
          datasets: [
            {
              data: spendingData,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Spending data color
              strokeWidth: 2, // Line thickness
            },
            // {
            //   data: trendLineData,
            //   color: (opacity = 1) => `rgba(99, 132, 255, ${opacity})`, // Trend line color
            //   strokeWidth: 2, // Line thickness
            // },
          ],
        }}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#1e2923",
          backgroundGradientTo: "#08130d",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          strokeWidth: 2,
        }}
        bezier
        style={{
          borderRadius: 16,
          marginTop: 10, // Small spacing below buttons
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  buttonScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#6200ee",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginHorizontal: 5, // Space between buttons
  },
  selectedButton: {
    backgroundColor: "#3700b3", // Darker shade for the selected button
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default SpendingChart;