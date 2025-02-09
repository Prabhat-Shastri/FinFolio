import { View, Text, StyleSheet } from "react-native";
import { Dimensions } from "react-native";

const StackedBarChart = () => {
  const screenWidth = Dimensions.get("window").width - 40;

  const data = [
    { name: "Food", percentage: 80, color: "#FF6384" },
    { name: "Transport", percentage: 60, color: "#36A2EB" },
    { name: "Shopping", percentage: 40, color: "#FFCE56" },
    { name: "Entertainment", percentage: 50, color: "#4BC0C0" },
    { name: "Bills", percentage: 70, color: "#9966FF" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Progress</Text>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          <Text style={styles.label}>{item.name}</Text>
          <View style={styles.barBackground}>
            <View
              style={[
                styles.barFill,
                { width: `${item.percentage}%`, backgroundColor: item.color },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  barContainer: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  barBackground: {
    width: "100%",
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 10,
  },
});

export default StackedBarChart;