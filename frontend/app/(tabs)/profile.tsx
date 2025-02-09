import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const { signOut, username } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirection back to /signin is handled in the tab layout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Info with Image */}
      <View style={styles.profileInfo}>
        <Image
          source={require("../../assets/images/profile.png")}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.name}>{username || "User"}</Text>
          <Text style={styles.email}>{username ? `${username}@example.com` : "user@example.com"}</Text>
        </View>
      </View>

      {/* Account Settings */}
      <TouchableOpacity 
        style={styles.option} 
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.optionText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.option} 
        onPress={() => router.push("/change-password")}
      >
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>

      {/* New Button: Connect Another Bank */}
      <TouchableOpacity 
        style={styles.option} 
        onPress={() => router.push("/connect-bank")}
      >
        <Text style={styles.optionText}>Connect Another Bank</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.option} 
        onPress={() => router.push("/privacy-security")}
      >
        <Text style={styles.optionText}>Privacy & Security</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleSignOut}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#121212", // Dark mode background
    paddingHorizontal: 20 
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    gap: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: "#ffffff" 
  },
  email: { 
    fontSize: 16, 
    color: "#cccccc" 
  },
  option: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#333",
    marginBottom: 10,
    alignItems: "center",
  },
  optionText: { 
    fontSize: 16, 
    color: "#ffffff" 
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#ff4d4d",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  logoutText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
});

export default ProfileScreen;
