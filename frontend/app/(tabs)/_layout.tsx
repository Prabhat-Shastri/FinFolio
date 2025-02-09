import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log("isAuthenticated:", isAuthenticated); // Logging from `ml` branch
    
    if (isMounted && !isAuthenticated) {
      console.log("Redirecting to /signin..."); // Logging before redirect
      router.replace("/signin");
    }
  }, [isMounted, isAuthenticated]);

  if (!isMounted) {
    return null; // Prevent rendering until mounted
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', // Active icon color
        tabBarInactiveTintColor: '#8E8E93', // Inactive icon color
        tabBarStyle: {
          backgroundColor: '#1C1C1E', // Dark background for the tab bar
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Saving",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
