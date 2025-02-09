import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function SetGoalModal(): JSX.Element {
  const username = "user_good"; // ✅ Hardcoded username
  const [newGoal, setNewGoal] = useState<string>("");
  const [timeFrame, setTimeFrame] = useState<string>("6"); // New state for time frame
  const router = useRouter();

  const updateSavingGoal = async (): Promise<void> => {
    if (!newGoal || isNaN(Number(newGoal)) || Number(newGoal) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid amount.");
      return;
    }

    if (!timeFrame || isNaN(Number(timeFrame)) || Number(timeFrame) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid time frame.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/set_goal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username, // ✅ Send hardcoded username
          amount: Number(newGoal), // ✅ Store as user.amount
          time_months: Number(timeFrame), // Use dynamic time frame
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${await response.text()}`);
      }

      Alert.alert("Success", "Saving goal updated successfully!");
      router.back(); // ✅ Navigate back to the Goals page
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Failed to update saving goal.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Saving Goal</Text>

      {/* Input field to enter new goal */}
      <TextInput
        style={styles.input}
        placeholder="Enter new saving goal"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={newGoal}
        onChangeText={setNewGoal}
      />

      <Text style={styles.title}>Time Frame in Months</Text>
      {/* Input field to enter time frame */}
      <TextInput
        style={styles.input}
        placeholder="Enter time frame in months"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={timeFrame}
        onChangeText={setTimeFrame}
      />

      <Button title="Submit" onPress={updateSavingGoal} />
      <Button title="Cancel" onPress={() => router.back()} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    color: "#fff",
    paddingHorizontal: 10,
    marginBottom: 10,
    textAlign: "center",
  },
});
