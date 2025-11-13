import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Avatar, Text, List, Divider, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // 🔹 Clear local login state
      await AsyncStorage.removeItem("isLoggedIn");

      // 🔹 Sign out from Firebase
      await signOut(auth);

      // 🔹 Redirect to login screen
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 Profile Info */}
      <View style={styles.profileSection}>
        <Avatar.Image
          size={80}
          source={{
            uri: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
          }}
        />
        <Text variant="titleMedium" style={styles.name}>
          Suji Dhanapal
        </Text>
        <Text style={styles.email}>suji@example.com</Text>
      </View>

      {/* 🔹 Settings List */}
      <View style={styles.settingsList}>
        <List.Item
          title="My Orders"
          left={() => <List.Icon icon="cart-outline" />}
          onPress={() => router.push("/auth/orders/myorders")}
        />
        <Divider />
        <List.Item
          title="Wishlist"
          left={() => <List.Icon icon="heart-outline" />}
          onPress={() => router.push("/wishlist")}
        />
        <Divider />
        <List.Item
          title="Account Settings"
          left={() => <List.Icon icon="account-cog-outline" />}
          onPress={() => router.push("/account")}
        />
        <Divider />
        <List.Item
          title="Notifications"
          left={() => <List.Icon icon="bell-outline" />}
          onPress={() => router.push("/notifications")}
        />
        <Divider />
        <List.Item
          title="Help & Support"
          left={() => <List.Icon icon="help-circle-outline" />}
          onPress={() => router.push("/support")}
        />
        <Divider />
        <List.Item
          title="Terms & Privacy Policy"
          left={() => <List.Icon icon="file-document-outline" />}
          onPress={() => router.push("/privacy")}
        />
      </View>

      {/* 🔹 Logout Button */}
      <Button
        mode="contained"
        buttonColor="#ff3366"
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 30,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 25,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  name: {
    marginTop: 10,
    fontWeight: "bold",
  },
  email: {
    color: "#888",
  },
  settingsList: {
    paddingLeft: 20,
    marginTop: 10,
  },
  logoutBtn: {
    margin: 20,
    borderRadius: 8,
  },
});
