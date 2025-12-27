// app/auth/register.js
import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig"; // Firebase auth & firestore
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    try {
      // Create auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        avatar: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.push("/start");
    } catch (error) {
      let message = "";
      switch (error.code) {
        case "auth/email-already-in-use":
          message = "This email is already in use.";
          break;
        case "auth/invalid-email":
          message = "Invalid email address format.";
          break;
        case "auth/weak-password":
          message = "Password should be at least 6 characters.";
          break;
        default:
          message = error.message;
      }
      Alert.alert("Registration Error", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an account</Text>

      <TextInput
        label="Full Name"
        mode="outlined"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        label="Phone Number"
        mode="outlined"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        label="Email"
        mode="outlined"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry={!passwordVisible1}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={passwordVisible1 ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible1(!passwordVisible1)}
            size={17}
          />
        }
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        label="Confirm Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry={!passwordVisible2}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={passwordVisible2 ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible2(!passwordVisible2)}
            size={17}
          />
        }
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.agreeText}>
        By clicking the <Text style={styles.link}>Register</Text> button, you agree to the public offer
      </Text>

      <Button mode="contained" style={styles.button} onPress={handleRegister}>
        Create Account
      </Button>

      <Text style={styles.or}>- OR Continue with -</Text>

      <View style={styles.socials}>
        <Text> Google || Apple || Facebook</Text>
      </View>

      <Link href="/auth/login" asChild>
        <TouchableOpacity>
          <Text style={styles.bottomText}>
            I Already Have an Account <Text style={styles.link}>Login</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  input: { marginBottom: 15 },
  agreeText: { fontSize: 12, marginBottom: 10 },
  link: { color: "#f43f5e" },
  button: { backgroundColor: "#f43f5e", marginVertical: 10 },
  or: { textAlign: "center", marginVertical: 15 },
  socials: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  bottomText: { textAlign: "center" },
});
