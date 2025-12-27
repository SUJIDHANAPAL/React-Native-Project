// app/account/accountsettings.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, List, Divider, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function AccountSettings() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [user, setUser] = useState(null);

  // 🔹 Fetch user info from Firestore
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (error) {
        console.error("Fetch User Error:", error);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <ScrollView style={styles.container}>
      {/* 🔹 User Profile Section */}
      <View style={styles.profileSection}>
        <Avatar.Image
          size={90}
          source={{
            uri:
              user?.avatar ||
              "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
          }}
        />
        <Text style={styles.name}>{user?.name || "Loading..."}</Text>
        <Text style={styles.email}>{user?.email || "Loading..."}</Text>
      </View>

      {/* 🔹 Account Items */}
      <View style={styles.listContainer}>
        <List.Section>
          <List.Subheader style={styles.header}>
            Account Settings
          </List.Subheader>

          <List.Item
            title="Manage Address"
            description="Add or edit delivery addresses"
            left={() => <List.Icon icon="map-marker-outline" />}
            onPress={() => router.push("/account/address")}
          />
          <Divider />

          <List.Item
            title="Change Password"
            description="Update your login password"
            left={() => <List.Icon icon="lock-outline" />}
            onPress={() => router.push("/account/changepassword")}
          />
          <Divider />

          <List.Item
            title="Payment Methods"
            description="Saved UPI / Cards"
            left={() => <List.Icon icon="credit-card-outline" />}
            onPress={() => router.push("/account/payment")}
          />
          <Divider />

          <List.Item
            title="Delete My Account"
            description="Permanently remove my account"
            left={() => <List.Icon icon="delete-outline" color="red" />}
            titleStyle={{ color: "red" }}
            onPress={() => router.push("/account/delete")}
          />
        </List.Section>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  email: {
    color: "#777",
  },
  listContainer: {
    marginTop: 10,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
});
