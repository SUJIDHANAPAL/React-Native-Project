import React, { useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user is logged in");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password to confirm");
      return;
    }

    // 🔹 Confirm deletion
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // 🔹 Re-authenticate
              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);

              // 🔹 Delete user
              await deleteUser(user);

              Alert.alert("Deleted", "Your account has been deleted successfully.");
              router.replace("/auth/login"); // Navigate to login after deletion
            } catch (error) {
              console.log(error);
              if (error.code === "auth/wrong-password") {
                Alert.alert("Error", "Password is incorrect");
              } else {
                Alert.alert("Error", error.message);
              }
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.warning}>
        Warning: This action is permanent. All your data will be lost.
      </Text>

      <TextInput
        label="Enter your password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        left={<TextInput.Icon icon="lock" />}
      />

      <Button mode="contained" buttonColor="#ff3b30" style={styles.button} onPress={handleDeleteAccount}>
        Delete My Account
      </Button>

      <Button mode="text" style={styles.backButton} onPress={() => router.back()}>
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  warning: { color: "red", marginBottom: 20 },
  input: { marginBottom: 12 },
  button: { marginTop: 10 },
  backButton: { marginTop: 10, alignSelf: "center" },
});
