import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Categories() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const list = [];
    querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    setCategories(list);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!category.trim()) return;
    await addDoc(collection(db, "categories"), { name: category });
    setCategory("");
    fetchCategories();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter category name"
        value={category}
        onChangeText={setCategory}
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Existing Categories</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#f8f8f8" },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  button: { backgroundColor: "#4B0082", padding: 10, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center" },
  item: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginVertical: 5 },
});
