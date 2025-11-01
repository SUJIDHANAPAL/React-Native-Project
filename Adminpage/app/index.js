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

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        alert("✅ Login successful!");
        router.push("/admin/AddProduct"); // navigate to admin page
      } else {
        alert("⚠️ Please verify your email before logging in.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

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


      <Button mode="contained" onPress={handleLogin}>
        Login
      </Button>

      <Link href="/auth/Register" asChild>
        <Text style={styles.bottomText}>
          Don’t have an account? <Text style={styles.link}>Register</Text>
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#6200ee",
    marginBottom: 25,
  },
  input: {
    marginBottom: 15,
    backgroundColor: "#f6f6f6",
  },
  bottomText: {
    textAlign: "center",
    marginTop: 20,
    color: "#444",
  },
  link: {
    color: "#6200ee",
    fontWeight: "bold",
  },
  forgotText: {
  textAlign: "right",
  color: "#6200ee",
  marginBottom: 10,
  fontWeight: "bold",
},

});
