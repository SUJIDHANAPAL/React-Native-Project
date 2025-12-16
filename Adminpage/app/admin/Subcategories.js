import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Subcategories() {
  const [subCategoryName, setSubCategoryName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // 🔹 Load Categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));

        const list = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((item) => item.category); // remove empty or undefined

        setCategories(list);
      } catch (error) {
        console.log("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // 🔹 Load Subcategories list
  const loadSubcategories = async () => {
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

  useEffect(() => {
    loadSubcategories();
  }, []);

  // 🔹 Save or Update Subcategory
  const handleSave = async () => {
    if (!subCategoryName.trim() || !category.trim()) {
      alert("Please select a category and enter a subcategory name!");
      return;
    }

    try {
      if (editingId) {
        const subRef = doc(db, "subcategories", editingId);
        await updateDoc(subRef, {
          category,
          subCategoryName,
        });
        alert("Subcategory updated successfully!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "subcategories"), {
          category,
          subCategoryName,
          createdAt: new Date(),
        });
        alert("Subcategory added successfully!");
      }

      setSubCategoryName("");
      setCategory("");
      loadSubcategories();
    } catch (error) {
      console.log("Error saving subcategory:", error);
    }
  };

  // 🔹 Edit Subcategory
  const handleEdit = (item) => {
    setEditingId(item.id);
    setCategory(item.category);
    setSubCategoryName(item.subCategoryName);
  };

  // 🔹 Delete Subcategory
  const handleDelete = async (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this subcategory?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "subcategories", id));
            alert("Subcategory deleted successfully!");
            loadSubcategories();
          } catch (error) {
            console.log("Error deleting subcategory:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {editingId ? "✏️ Edit Subcategory" : "🗂 Add Subcategory"}
      </Text>

      {/* Category Dropdown */}
      <View style={styles.dropdownContainer}>
        <Picker selectedValue={category} onValueChange={setCategory} style={styles.dropdown}>
          <Picker.Item label="Select a Category" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.category} value={cat.category} />
          ))}
        </Picker>
      </View>

      {/* Subcategory Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Subcategory Name"
        value={subCategoryName}
        onChangeText={setSubCategoryName}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleSave}>
        <Text style={styles.addButtonText}>
          {editingId ? "Update Subcategory" : "Add Subcategory"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>📋 Existing Subcategories</Text>
      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.category} → {item.subCategoryName}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4B0082",
    marginBottom: 20,
    marginTop: 25,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  dropdown: {
    height: 50,
    width: "100%",
  },
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
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4B0082",
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: { fontSize: 16, color: "#333" },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  editText: {
    color: "#4B0082",
    fontWeight: "bold",
    marginRight: 15,
  },
  deleteText: {
    color: "red",
    fontWeight: "bold",
  },
});
