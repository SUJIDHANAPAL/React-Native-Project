import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useRouter, Link } from "expo-router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("⚠️ Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        alert("✅ Login successful!");
        router.push("/admin/Dashboard"); // 👈 redirect to Admin Dashboard (with sidebar)
      } else {
        alert("⚠️ Please verify your email before logging in.");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Link href="/ForgotPassword" asChild>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </Link>

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.loginButton}
      >
        Login
      </Button>

      <Link href="/auth/Register" asChild>
        <Text style={styles.bottomText}>
          Don’t have an account?{" "}
          <Text style={styles.link}>Register</Text>
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4B0082", // 👈 matches your top bar color
    marginBottom: 25,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#f6f6f6",
  },
  forgotText: {
    textAlign: "right",
    color: "#4B0082",
    marginBottom: 10,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#4B0082",
    borderRadius: 8,
    paddingVertical: 5,
  },
  bottomText: {
    textAlign: "center",
    marginTop: 25,
    color: "#444",
    fontSize: 14,
  },
  link: {
    color: "#4B0082",
    fontWeight: "bold",
  },
});
