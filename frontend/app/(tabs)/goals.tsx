import { View, Text, StyleSheet, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import ToolTip from '@/src/components/ToolTip';

interface GoalData {
  amount: number;
  time_months: number;
}

export default function GoalsScreen(): JSX.Element {
  const username = "user_good"; // ✅ Hardcoded username
  const [goalAmount, setGoalAmount] = useState<number | null>(null);
  const [timeToAchieve, setTimeToAchieve] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchGoalData = async (): Promise<void> => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/get_goal?username=${username}`);
      if (!response.ok) {
        throw new Error(`Goal API Error: ${await response.text()}`);
      }
      const data: GoalData = await response.json();

      if (!data.amount) {
        throw new Error("No goal data found");
      }

      setGoalAmount(data.amount);
      setTimeToAchieve(data.time_months);
    } catch (error) {
      console.error("Error fetching goal data:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Refresh goal data when returning to this screen
  useFocusEffect(
    useCallback(() => {
      fetchGoalData();
    }, [])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#fff" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tooltipContainer}>
        <ToolTip message="Goals Tip: Set a goal to save for something specific and reach it faster!" />
      </View>
      <Text style={styles.title}>Your Goal</Text>

      {/* Goal Card */}
      <View style={styles.goalCard}>
        <Text style={styles.goalAmount}>${goalAmount?.toLocaleString()}</Text>
        <Text style={styles.goalSubtitle}>Total Saving Goal</Text>
      </View>

      <Text style={styles.durationText}>Time Duration: {timeToAchieve} months</Text>

      {/* Set New Goal Button */}
      <TouchableOpacity style={styles.setGoalButton} onPress={() => router.push("/set-goal-modal")}>
        <Text style={styles.setGoalButtonText}>Set New Saving Goal</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", // Dark mode background
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: "#1E1E1E",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: "80%",
    marginBottom: 20,
  },
  goalAmount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#4CAF50", // Green pop color
  },
  goalSubtitle: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 5,
  },
  durationText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
  },
  setGoalButton: {
    backgroundColor: "#4CAF50", // Green button to match the goal
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  setGoalButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 50,
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
  },
});
