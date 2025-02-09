import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

const ChangePasswordScreen: React.FC = () => {
  const router = useRouter();
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ currentPassword: string; newPassword: string; confirmPassword: string }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = (): boolean => {
    const newErrors = { currentPassword: "", newPassword: "", confirmPassword: "" };
    let isValid = true;

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!formData.newPassword || formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await updatePassword(formData.currentPassword, formData.newPassword);
        Alert.alert("Success", "Password updated successfully");
        router.back();
      } catch (error) {
        Alert.alert("Error", "Failed to update password. Please try again.");
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Change Password</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput style={styles.input} secureTextEntry value={formData.currentPassword} onChangeText={(text) => setFormData((prev) => ({ ...prev, currentPassword: text }))} placeholder="Enter current password" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <TextInput style={styles.input} secureTextEntry value={formData.newPassword} onChangeText={(text) => setFormData((prev) => ({ ...prev, newPassword: text }))} placeholder="Enter new password" />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e1e1e",
  },
  formContainer: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 30,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#ffffff",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#333",
    color: "#ffffff",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

