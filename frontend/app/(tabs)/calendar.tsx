import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import CalendarComponent from '@/src/components/Calendar';
import WarningComponent from '@/src/components/Warning';
import ToolTip from '@/src/components/ToolTip';
import RedirectButtonComponent from '@/src/components/RedirectButtonComponent';

export default function HomeScreen() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const paymentInfo = {
    paymentName: "Rent",
    dueDate: "2025-02-20",
    amount: 750,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.tooltipContainer}>
        <ToolTip message="Calendar Tip: Use the calendar to see your upcoming payments and set reminders!" />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <CalendarComponent></CalendarComponent>
        <WarningComponent
          message="Warning: Your balance is too low to meet your upcoming payment!"
          paymentInfo={paymentInfo}
        />
        <RedirectButtonComponent message="You have a paycheck coming up, manage your savings!" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212", // Dark mode background
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 1000,
    paddingBottom: 0,
  },
  scrollViewContent: {
    paddingBottom: 20,
    alignItems: 'center',
    flexGrow: 1, // Ensures the scroll content expands properly
  },
});

