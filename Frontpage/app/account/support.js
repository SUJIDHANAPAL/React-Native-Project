import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function SupportScreen() {
  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "supportMessages"), {
        userId: auth.currentUser ? auth.currentUser.uid : "guest",
        name,
        email,
        message,
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", "Your message has been sent. We will contact you soon!");
      setMessage("");
    } catch (error) {
      console.log("Support message error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help & Support</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.subtitle}>Frequently Asked Questions</Text>
          <Text>• How do I reset my password?</Text>
          <Text>• How do I update my payment method?</Text>
          <Text>• How do I delete my account?</Text>
        </Card.Content>
      </Card>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>Send us a message</Text>

      <TextInput
        label="Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Message"
        mode="outlined"
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        style={styles.input}
      />

      <Button mode="contained" style={styles.button} onPress={handleSubmit}>
        Submit
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, alignSelf: "center" },
  subtitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  card: { padding: 10, marginBottom: 20 },
  input: { marginBottom: 12 },
  button: { backgroundColor: "#f43f5e", marginTop: 10 },
});
