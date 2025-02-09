// app/register.tsx
import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

const RegisterScreen: React.FC = () => {
  const router = useRouter();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (username === "abcd" && password === "abcd") {
      setIsLoading(true);
      try {
        await signIn();
        router.replace("/(tabs)");
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please use username: abcd and password: abcd");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      
      <TextInput
        style={[styles.input, { color: '#fff' }]}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      
      <TextInput
        style={[styles.input, { color: '#fff' }]}
        placeholder="Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button 
          title="Sign In" 
          onPress={handleRegister}
          disabled={isLoading}
        />
        
        <Button 
          title="Back to Register" 
          onPress={() => router.back()}
          disabled={isLoading}
        />
      </View>

      {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1e1e1e",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "100%",
    maxWidth: 300,
    height: 40,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#333",
  },
  buttonContainer: {
    gap: 15,
    width: "100%",
    maxWidth: 300,
  }
});

export default RegisterScreen;
