import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PaymentScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [amount, setAmount] = useState("");

  const handlePayment = async () => {
    // Validation
    if (!name || !cardNumber || !expiry || !cvv || !amount) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (cardNumber.length < 12) {
      Alert.alert("Error", "Card number is invalid");
      return;
    }

    try {
      // 🔹 Store payment data in Firestore
      await addDoc(collection(db, "payments"), {
        userId: auth.currentUser ? auth.currentUser.uid : "guest",
        name,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`, // mask sensitive info
        expiry,
        amount: parseFloat(amount),
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success", `Payment of ₹${amount} was successful!`);

      // Reset form
      setName("");
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setAmount("");

      router.back(); // optional: navigate back after payment
    } catch (error) {
      console.log("Payment error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <TextInput
        label="Name on Card"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Card Number"
        mode="outlined"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.row}>
        <TextInput
          label="Expiry (MM/YY)"
          mode="outlined"
          value={expiry}
          onChangeText={setExpiry}
          style={[styles.input, { flex: 1, marginRight: 5 }]}
        />
        <TextInput
          label="CVV"
          mode="outlined"
          value={cvv}
          onChangeText={setCvv}
          keyboardType="numeric"
          secureTextEntry
          style={[styles.input, { flex: 1, marginLeft: 5 }]}
        />
      </View>

      <TextInput
        label="Amount (₹)"
        mode="outlined"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button mode="contained" style={styles.button} onPress={handlePayment}>
        Pay Now
      </Button>

      <Button mode="text" style={styles.backButton} onPress={() => router.back()}>
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, alignSelf: "center" },
  input: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  button: { backgroundColor: "#f43f5e", marginTop: 10 },
  backButton: { marginTop: 10, alignSelf: "center" },
});
