import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const addProduct = async () => {
    try {
      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        image,
        description,
      });
      alert("✅ Product added successfully!");
      setName(""); setPrice(""); setImage(""); setDescription("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Add Product</Text>
      <TextInput label="Product Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput label="Image URL" value={image} onChangeText={setImage} style={styles.input} />
      <TextInput label="Description" value={description} onChangeText={setDescription} multiline style={styles.input} />
      <Button mode="contained" onPress={addProduct}>Add Product</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { marginBottom: 10 },
});
