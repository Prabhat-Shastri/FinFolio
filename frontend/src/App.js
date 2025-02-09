import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import CustomButton from './src/components/Button';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <CustomButton 
          title="Press Me!" 
          onPress={() => alert('Button pressed!')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});