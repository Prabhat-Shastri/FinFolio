import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Subscription {
  name: string;
  logo: any;
  dueDate: number;
  amount: number;
}

const subscriptions: Subscription[] = [
  {
    name: 'Netflix',
    logo: require('../../assets/subscription-logos/netflix.png'),
    dueDate: 15,
    amount: 15.99
  },
  {
    name: 'Verizon',
    logo: require('../../assets/subscription-logos/verizon.png'),
    dueDate: 3,
    amount: 75.00
  },
  {
    name: 'Hulu',
    logo: require('../../assets/subscription-logos/hulu.png'),
    dueDate: 21,
    amount: 7.99
  },
  {
    name: 'Spotify',
    logo: require('../../assets/subscription-logos/spotify.png'),
    dueDate: 7,
    amount: 9.99
  },
  {
    name: 'Apple iCloud',
    logo: require('../../assets/subscription-logos/icloud.png'),
    dueDate: 12,
    amount: 2.99
  }
];

const SubscriptionsList: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Subscriptions</Text>
      {subscriptions.map((sub, index) => (
        <View key={sub.name} style={styles.subscriptionItem}>
          <View style={styles.leftContent}>
            <Image source={sub.logo} style={styles.logo} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{sub.name}</Text>
              <Text style={styles.date}>Due Feb {sub.dueDate}</Text>
            </View>
          </View>
          <Text style={styles.amount}>${sub.amount.toFixed(2)}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  date: {
    color: '#8E8E93',
    fontSize: 14,
  },
  amount: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SubscriptionsList; 