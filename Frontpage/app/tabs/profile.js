import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Text, Button, TextInput, Card, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';

export default function Profile() {
  const router = useRouter();
  const auth = getAuth();

  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    avatar:
      'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png',
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
  });

  const handleSave = () => {
    setUser({ ...user, ...formData });
    setEditMode(false);
  };

  // 🔹 Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logout Successful", "You have been signed out.");
      router.replace('/auth/login'); // Redirect to login
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Avatar.Image size={100} source={{ uri: user.avatar }} />
        <Text variant="titleLarge" style={styles.name}>
          {user.name}
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Account Details</Text>
          <Divider style={{ marginVertical: 10 }} />

          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData((d) => ({ ...d, name: text }))}
            disabled={!editMode}
            style={styles.input}
          />
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData((d) => ({ ...d, email: text }))}
            disabled={!editMode}
            style={styles.input}
          />
          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData((d) => ({ ...d, phone: text }))}
            disabled={!editMode}
            style={styles.input}
          />

          {editMode ? (
            <Button mode="contained" onPress={handleSave} style={styles.button}>
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
  container: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  name: {
    marginTop: 15,
  },
  card: {
    width: '100%',
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginTop: 20,
  },
});
