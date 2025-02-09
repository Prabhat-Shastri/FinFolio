import React, { useState, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, Alert, StyleSheet, TextInput, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

const LOGIN_URL = "http://localhost:8000/login";
const CREATE_LINK_TOKEN_URL = "http://localhost:8000/create_link_token";
const EXCHANGE_PUBLIC_TOKEN_URL = "http://localhost:8000/exchange_public_token";

const SignInScreen: React.FC = () => {
  const router = useRouter();
  const { signIn, isLoading: authLoading, setUsername } = useAuth();
  const [username, setLocalUsername] = useState("user_good");
  const [password, setPassword] = useState("pass_good");
  const [isLoading, setIsLoading] = useState(false);
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => {
      subscription.remove();
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const handleDeepLink = async (event: { url: string }) => {
    console.log("Deep link received:", event.url);
    try {
      const urlObj = new URL(event.url);
      const publicToken = urlObj.searchParams.get("public_token");

      if (publicToken) {
        console.log("Public token received:", publicToken);
        if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
        await WebBrowser.dismissBrowser();
        await handlePublicTokenExchange(publicToken);
      } else {
        console.log("No public token found in deep link");
        await WebBrowser.dismissBrowser();
      }
    } catch (error) {
      console.error("Error parsing deep link:", error);
      await WebBrowser.dismissBrowser();
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        console.log("Login successful. Fetching link token...");
        setUsername(username);
        await fetchLinkToken();
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLinkToken = async () => {
    try {
      const response = await fetch(CREATE_LINK_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.link_token) {
        await openPlaidLink(data.link_token);
      } else {
        throw new Error("Link token not received");
      }
    } catch (error) {
      console.error("Error fetching link token:", error);
      Alert.alert("Error", "Unable to get link token.");
    }
  };

  const openPlaidLink = async (token: string) => {
    try {
      const redirectUrl = Linking.createURL("plaid");
      const authUrl = `https://cdn.plaid.com/link/v2/stable/link.html?token=${token}&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}`;

      fallbackTimer.current = setTimeout(async () => {
        console.log("⚠️ Fallback timeout reached");
        await WebBrowser.dismissBrowser();
      }, 10000);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      console.log("📱 Plaid WebBrowser result:", result);
      
      if (result.type === "cancel") {
        console.log("❌ User cancelled Plaid flow");
        try {
          await signIn(username);
          router.replace("/(tabs)");
        } catch (error) {
          console.error("🚨 Error during sign in:", error);
        }
      }
    } catch (error) {
      console.error("🚨 Error in Plaid flow:", error);
      Alert.alert("Error", "An issue occurred with Plaid Link.");
    } finally {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    }
  };

  const handlePublicTokenExchange = async (publicToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(EXCHANGE_PUBLIC_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, public_token: publicToken }),
      });
      const data = await response.json();

      if (response.ok && data.access_token) {
        console.log("Access token exchange successful");
        await signIn(username);
        router.replace("/(tabs)");
      } else {
        throw new Error("Access token exchange failed");
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
      Alert.alert("Error", "Failed to link bank account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#8E8E93"
        value={username}
        onChangeText={setLocalUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8E8E93"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Text 
          style={styles.button}
          onPress={handleLogin}
        >
          Register With Plaid
        </Text>
        <Text 
          style={styles.registerButton}
          onPress={() => router.push("/register")}
        >
          Already have an account? Sign In
        </Text>
      </View>
      {(isLoading || authLoading) && <ActivityIndicator color="#007AFF" style={{ marginTop: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000000",
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  input: {
    width: "100%",
    maxWidth: 300,
    height: 50,
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
    maxWidth: 300,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
});

export default SignInScreen;
