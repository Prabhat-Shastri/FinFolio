import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const PrivacySecurityScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>We Help Keep Data Safe, Every Step of the Way</Text>
        <Text style={styles.paragraph}>
          Your financial information is both personal and powerful — that’s why security is a top priority when we're 
          designing our products, policies, and practices.
        </Text>

        <Text style={styles.subheading}>Security You Can Trust</Text>
        <Text style={styles.paragraph}>
          Our information security program is designed to meet or exceed industry standards, and we use many different 
          controls to keep your personal information safe.
        </Text>

        <Text style={styles.subheading}>Plaid’s Certifications</Text>
        <Text style={styles.paragraph}>
          Plaid is certified in internationally-recognized security standards:
        </Text>

        <View style={styles.list}>
          <Text style={styles.listItem}>• ISO 27001 Certified</Text>
          <Text style={styles.listItem}>• ISO 27701 Certified</Text>
          <Text style={styles.listItem}>• SSAE18 SOC 2 Compliant</Text>
        </View>

        <Text style={styles.paragraph}>
          We continuously update our security measures to protect your financial data and ensure a secure experience.
        </Text>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e", // Dark theme background
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  subheading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#cccccc",
    lineHeight: 24,
    marginBottom: 10,
  },
  list: {
    marginBottom: 15,
  },
  listItem: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 5,
  },
  backButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PrivacySecurityScreen;
