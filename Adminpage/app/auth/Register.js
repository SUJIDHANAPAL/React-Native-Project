import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter, Link } from "expo-router";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // ✅ Create the user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Send email verification
      await sendEmailVerification(user);

      alert(
        "✅ Registered successfully! A verification link has been sent to your email. Please verify before logging in."
      );

      // Redirect to login
      router.push("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

      <Button mode="contained" onPress={handleRegister}>Register</Button>

      <Link href="/" asChild>
        <Text style={styles.bottomText}>
          Already have an account? <Text style={styles.link}>Login</Text>
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { marginBottom: 15 },
  bottomText: { textAlign: "center", marginTop: 20 },
  link: { color: "blue", fontWeight: "bold" },
});
