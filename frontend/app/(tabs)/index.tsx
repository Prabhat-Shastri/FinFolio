import { ScrollView, StyleSheet, View, Text, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import SpendingChart from '../../src/components/Graph';
import StackedBarChart from '@/src/components/BudgetBars';
import { API_URL } from '@/src/config';
import TransactionList from '@/src/components/TransactionList';
import TopTwoSpenders from '@/src/components/TopTwoSpenders';
import SubscriptionsList from '@/src/components/Subscriptions';
import SpendingGraph from '@/src/components/Graph';
import SpendingProgress from '@/src/components/SpendingProgress';
import ToolTip from '@/src/components/ToolTip';

export default function HomeScreen() {
  const [spendingData, setSpendingData] = useState<{
    all: Record<string, number>;
    food: Record<string, number>;
    travel: Record<string, number>;
    entertainment: Record<string, number>;
  }>({
    all: {},
    food: {},
    travel: {},
    entertainment: {}
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [topSpenders, setTopSpenders] = useState({
    top_spender: '',
    top2_spender: '',
    top_spender_count: 0,
    top2_spender_count: 0,
  });

  const [isAlert, setIsAlert] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const [predictedValues, setPredictedValues] = useState({
    food: 0,
    entertainment: 0,
    travel: 0
  });

  const fetchAllData = async () => {
    try {
      // Fetch all data in parallel
      const [transactionsRes, allRes, foodRes, travelRes, entertainmentRes] = await Promise.all([
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/graph_data`),
        fetch(`${API_URL}/graph_data_food`),
        fetch(`${API_URL}/graph_data_travel`),
        fetch(`${API_URL}/graph_data_entertainment`)
      ]);

      // Process all responses in parallel
      const [transactionsData, allData, foodData, travelData, entertainmentData] = await Promise.all([
        transactionsRes.json(),
        allRes.json(),
        foodRes.json(),
        travelRes.json(),
        entertainmentRes.json()
      ]);

      // Add debug logging
      console.log('All spending data:', allData);
      console.log('Food spending data:', foodData);

      // Update transactions
      setTransactions(transactionsData.transactions || []);

      // Update spending data with cumulative_spending
      setSpendingData({
        all: allData.cumulative_spending || {},
        food: foodData.cumulative_spending || {},
        travel: travelData.cumulative_spending || {},
        entertainment: entertainmentData.cumulative_spending || {}
      });

      // Add debug logging for final state
      console.log('Updated spending data state:', spendingData);

      console.log('Data updated:', { transactions: transactionsData, graphs: allData });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const checkAlertStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/alert_status`);
      const data = await response.json();
      console.log('Alert Status Response:', data);
      
      if ((data.isalert === true || data.isalert === 1) && !isAlert) {
        setIsAlert(true);
        Alert.alert(
          "High Value Transaction Detected",
          "A transaction over $100 has been detected. Please verify this transaction.",
          [
            {
              text: "Verify",
              onPress: () => handleAlertResolve("yes"),
            },
            {
              text: "Report Fraud",
              onPress: () => handleAlertResolve("report"),
              style: "destructive"
            }
          ],
          { cancelable: false } // Prevent dismissing the alert by tapping outside
        );
      }
    } catch (error) {
      console.error('Error checking alert status:', error);
    }
  };

  const handleAlertResolve = async (action: "yes" | "report") => {
    try {
      const response = await fetch(`${API_URL}/alert_resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        setIsAlert(false);
        setShouldRefetch(true); // Trigger refetch
        
        Alert.alert(
          action === "yes" ? "Transaction Verified" : "Fraud Reported",
          action === "yes" 
            ? "Thank you for verifying this transaction." 
            : "This transaction has been reported as fraudulent.",
          [{ 
            text: "OK",
            onPress: async () => {
              await fetchAllData(); // Immediate fetch
              setShouldRefetch(false);
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      Alert.alert("Error", "Failed to process your response. Please try again.");
    }
  };

  useEffect(() => {
    fetchAllData(); // Initial fetch

    const interval = setInterval(() => {
      if (!isAlert) { // Only fetch if no alert is showing
        fetchAllData();
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [isAlert, shouldRefetch]); // Dependencies

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch spending graph data
        const [allRes, foodRes, travelRes, entertainmentRes] = await Promise.all([
          fetch(`${API_URL}/graph_data`),
          fetch(`${API_URL}/graph_data_food`),
          fetch(`${API_URL}/graph_data_travel`),
          fetch(`${API_URL}/graph_data_entertainment`)
        ]);

        const [allData, foodData, travelData, entertainmentData] = await Promise.all([
          allRes.json(),
          foodRes.json(),
          travelRes.json(),
          entertainmentRes.json()
        ]);

        setSpendingData({
          all: allData.cumulative_spending || {},
          food: foodData.cumulative_spending || {},
          travel: travelData.cumulative_spending || {},
          entertainment: entertainmentData.cumulative_spending || {}
        });

        // Call /top_spenders using POST.
        // The backend expects the username as a query parameter,
        // so we append it to the URL. Here, the user ID is hardcoded as "user_good".
        const topSpendersRes = await fetch(
          `${API_URL}/top_spenders?username=user_good`,
          { method: "POST" }
        );
        const topSpendersData = await topSpendersRes.json();
        console.log('Top Spenders Data:', topSpendersData);
        
        setTopSpenders({
          top_spender: topSpendersData.top_spender || '',
          top2_spender: topSpendersData.top2_spender || '',
          top_spender_count: topSpendersData.top_spender_count || 0,
          top2_spender_count: topSpendersData.top2_spender_count || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    checkAlertStatus();
    
    const interval = setInterval(checkAlertStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 'all', title: 'Total Spending', color: '#007AFF' },
    { id: 'food', title: 'Food Spending', color: '#34C759' },
    { id: 'travel', title: 'Travel Spending', color: '#FF9500' },
    { id: 'entertainment', title: 'Entertainment Spending', color: '#AF52DE' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tooltipContainer}>
        <ToolTip message="Track and manage your spending effortlessly with this dashboard! View total spending trends, top spending categories, and budget progress. Keep an eye on upcoming subscriptions and recent transactions to stay financially organized. 🚀💰" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.buttonContainer}
          contentContainerStyle={styles.buttonContentContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.button,
                selectedCategory === category.id && styles.selectedButton,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.buttonText,
                  selectedCategory === category.id && styles.selectedButtonText,
                ]}
              >
                {category.id.charAt(0).toUpperCase() + category.id.slice(1)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {categories.map((category) => (
          selectedCategory === category.id && (
            <View key={category.id}>
              <SpendingGraph
                key={category.id}
                data={spendingData[category.id as keyof typeof spendingData] ?? {}}
                predictedValue={predictedValues[category.id as keyof typeof predictedValues] ?? 0}
                category={category.id as 'all' | 'food' | 'entertainment' | 'travel'}
                title={category.title}
                color={category.color}
              />
            </View>
          )
        ))}
        <TopTwoSpenders
          topSpender={topSpenders.top_spender}
          top2Spender={topSpenders.top2_spender}
          topSpenderCount={topSpenders.top_spender_count}
          top2SpenderCount={topSpenders.top2_spender_count}
        />

                <SpendingProgress category="food" color="#FF6B6B" />
        <SpendingProgress category="entertainment" color="#4ECDC4" />
        <SpendingProgress category="travel" color="#45B7D1" />

        <SubscriptionsList />
        <TransactionList transactions={transactions} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 0 ,
  },
  scrollViewContent: {
    padding: 16,
    paddingTop: 0,
  },
  buttonContainer: {
    marginBottom: 8,
    marginTop: 0,
  },
  buttonContentContainer: {
    paddingRight: 16, // Add padding for last button
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selectedButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  totalSpendingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
  },
});
