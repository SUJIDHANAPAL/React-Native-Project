import React, { useState } from "react";
import { View, StyleSheet, Text, Alert, TouchableOpacity } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { auth } from "../../firebaseConfig"; 
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Navigate to Forgot Password screen
  const handleForgotPassword = () => {
    router.push("/auth/forgotpassword");
  };

  const handlePasswordUpdate = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "No user is logged in");
      return;
    }

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("Success", "Your password has been updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      router.back();

    } catch (error) {
      console.log(error);
      if (error.code === "auth/wrong-password") {
        Alert.alert("Error", "Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "New password is too weak");
      } else {
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Password</Text>

      <TextInput
        label="Current Password"
        secureTextEntry
        mode="outlined"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
        left={<TextInput.Icon icon="lock" />}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TextInput
        label="New Password"
        secureTextEntry
        mode="outlined"
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        left={<TextInput.Icon icon="lock-outline" />}
      />

      <TextInput
        label="Confirm New Password"
        secureTextEntry
        mode="outlined"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        left={<TextInput.Icon icon="lock-check" />}
      />

      <Button mode="contained" style={styles.button} onPress={handlePasswordUpdate}>
        Update Password
      </Button>

      <Button mode="text" style={styles.backButton} onPress={() => router.back()}>
        Back
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { marginBottom: 12 },
  button: { backgroundColor: "#f43f5e", marginTop: 10 },
  backButton: { marginTop: 10, alignSelf: "center" },
  forgotPasswordText: { color: "#3b82f6", marginBottom: 12, alignSelf: "flex-end" },
});
