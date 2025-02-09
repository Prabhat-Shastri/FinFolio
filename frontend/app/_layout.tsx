import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useNavigation, useFocusEffect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import Popover from "react-native-popover-view";
import { AuthProvider } from "../src/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const navigation = useNavigation();


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Wait until fonts are loaded
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="signin" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ title: "Sign In", headerShown: true }} />
            <Stack.Screen name="edit-profile" options={{ title: "Edit Profile", headerShown: true, headerBackTitle: "Back", presentation: "card" }} />
            <Stack.Screen name="change-password" options={{ title: "Change Password", headerShown: true, headerBackTitle: "Back", presentation: "card" }}/>
            <Stack.Screen name="privacy-security" options={{ title: "Privacy & Security", headerShown: true }} />
            <Stack.Screen name="connect-bank" options={{ title: "Connect Bank", headerShown: true }} />
            <Stack.Screen name="set-goal-modal" options={{ title: "Set Goal", presentation: "modal" }} />
          </Stack>
          <StatusBar style="auto" />
        </View>
      </ThemeProvider>
    </AuthProvider>
  );
}
