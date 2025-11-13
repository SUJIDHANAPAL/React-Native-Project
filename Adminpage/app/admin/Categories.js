import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Categories() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  // 🔹 Live listener (real-time updates)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const list = snapshot.docs.map((docItem) => {
        const data = docItem.data();
        return {
          id: docItem.id,
          categoryName:
            data.categoryName || data.name || data.category || "Unnamed Category",
        };
      });
      setCategories(list);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Add a new category (saved as "categoryName")
  const handleAdd = async () => {
    if (!category.trim()) {
      Alert.alert("Error", "Please enter a category name!");
      return;
    }
    try {
      await addDoc(collection(db, "categories"), { categoryName: category });
      setCategory("");
    } catch (error) {
      console.log("Error adding category:", error);
    }
  };

  // 🔹 Open edit modal
  const openEditModal = (id, name) => {
    setEditId(id);
    setEditName(name);
    setEditModalVisible(true);
  };

  // 🔹 Save edited category name
  const handleEditSave = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Category name cannot be empty!");
      return;
    }
    try {
      await updateDoc(doc(db, "categories", editId), { categoryName: editName });
      setEditModalVisible(false);
    } catch (error) {
      console.log("Error updating category:", error);
    }
  };

  // 🔹 Delete category
  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this category?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteDoc(doc(db, "categories", id));
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🗂 Add Category</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter category name"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>Add Category</Text>
      </TouchableOpacity>

      <Text style={[styles.heading, { marginTop: 20 }]}>📋 Existing Categories</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemText}>{item.categoryName}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4B0082" }]}
                onPress={() => openEditModal(item.id, item.categoryName)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "red" }]}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* 🔹 Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Category</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter new name"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "gray" }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4B0082" }]}
                onPress={handleEditSave}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  heading: { fontSize: 20, fontWeight: "bold", color: "#4B0082", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#4B0082",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  itemText: { fontSize: 16, color: "#333", flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#4B0082" },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 10,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});
