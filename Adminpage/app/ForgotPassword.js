import React, { useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig"; // ✅ adjust if in another folder
import { useRouter, Link } from "expo-router";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Success 🎉",
        "Password reset email has been sent. Please check your inbox."
      );
      setEmail("");
      router.push("/"); // Go back to login page
    } catch (error) {
      let message = "Something went wrong.";
      if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address format.";
      }
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered email and we’ll send you a reset link.
      </Text>

      <TextInput
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handlePasswordReset}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Send Reset Link
      </Button>

      <Link href="/" asChild>
        <Text style={styles.bottomText}>
          Remembered your password?{" "}
          <Text style={styles.link}>Login</Text>
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#5C3DFF",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
    marginBottom: 25,
    marginTop: 8,
  },
  input: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  button: {
    paddingVertical: 5,
    borderRadius: 8,
  },
  bottomText: {
    textAlign: "center",
    marginTop: 25,
    color: "#333",
  },
  link: {
    color: "#5C3DFF",
    fontWeight: "bold",
  },
});
