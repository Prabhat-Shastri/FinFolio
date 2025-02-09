import { PieChart } from "react-native-chart-kit";
import { Dimensions, View, StyleSheet, Text } from "react-native";

const PieChartComponent = () => {
  const screenWidth = Dimensions.get("window").width;

  const data = [
    {
      name: "Food",
      amount: 200,
      color: "#FF6384",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
    {
      name: "Transport",
      amount: 150,
      color: "#36A2EB",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
    {
      name: "Shopping",
      amount: 100,
      color: "#FFCE56",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
    {
      name: "Entertainment",
      amount: 80,
      color: "#4BC0C0",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
    {
      name: "Bills",
      amount: 120,
      color: "#9966FF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 14,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending Breakdown</Text>
      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default PieChartComponent;