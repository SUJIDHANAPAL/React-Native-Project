// app/tabs/profile.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Avatar, Text, Button, TextInput, Card, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function Profile() {
  const router = useRouter();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    avatar:
      "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // 🔹 Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        Alert.alert("Not logged in", "Please login to view profile.");
        router.replace("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser(data);
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
          });
        } else {
          Alert.alert("No profile found", "Your account details are missing.");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        Alert.alert("Error", "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // 🔹 Save changes
  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "users", userId), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        updatedAt: serverTimestamp(),
      });
      setUser({ ...user, ...formData });
      setEditMode(false);
      Alert.alert("Success", "Profile updated");
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logout Successful", "You have been signed out.");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff3366" />
        <Text style={{ marginTop: 10 }}>Loading your account...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar.Image size={100} source={{ uri: user.avatar }} />
        <Text variant="titleLarge" style={styles.name}>
          {user.name || "User"}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Account Details</Text>
          <Divider style={{ marginVertical: 10 }} />

          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) =>
              setFormData((d) => ({ ...d, name: text }))
            }
            disabled={!editMode}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((d) => ({ ...d, email: text }))
            }
            disabled={!editMode}
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) =>
              setFormData((d) => ({ ...d, phone: text }))
            }
            disabled={!editMode}
            style={styles.input}
          />

          {editMode ? (
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              mode="outlined"
              buttonColor="#f24671ff"
              textColor="white"
              onPress={() => setEditMode(true)}
              style={styles.button}
            >
              Edit Profile
            </Button>
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained-tonal"
        textColor="#fff"
        buttonColor="#4B0082"
        onPress={handleLogout}
        style={{ marginTop: 30 }}
      >
        Logout
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 30,
  },
  name: {
    marginTop: 15,
  },
  card: {
    width: "100%",
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 20,
  },
});
