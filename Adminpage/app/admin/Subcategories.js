import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export default function Subcategories() {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  // 🔹 Load subcategories from Firestore
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const q = query(collection(db, "subcategories"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubcategories(list);
      } catch (error) {
        console.log("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  // 🔹 Add new subcategory
  const addSubcategory = async () => {
    if (!subCategoryName.trim() || !categoryName.trim()) {
      alert("Please enter both Category and Subcategory name!");
      return;
    }
    try {
      await addDoc(collection(db, "subcategories"), {
        subCategoryName,
        categoryName,
        createdAt: new Date(),
      });
      alert("Subcategory added successfully!");
      setSubCategoryName("");
      setCategoryName("");
    } catch (error) {
      console.log("Error adding subcategory:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🗂 Add Subcategory</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Category Name"
        value={categoryName}
        onChangeText={setCategoryName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Subcategory Name"
        value={subCategoryName}
        onChangeText={setSubCategoryName}
      />

      <TouchableOpacity style={styles.addButton} onPress={addSubcategory}>
        <Text style={styles.addButtonText}>Add Subcategory</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>📋 Existing Subcategories</Text>
      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.categoryName} → {item.subCategoryName}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "bold", color: "#4B0082", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#4B0082",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#4B0082" },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: { fontSize: 16, color: "#333" },
});
