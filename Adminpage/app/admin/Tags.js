import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

export default function Tags() {
  const [tagName, setTagName] = useState("");
  const [tags, setTags] = useState([]);

  // For edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editTag, setEditTag] = useState(null);
  const [editName, setEditName] = useState("");

  // 🔹 Real-time listener for tags
 useEffect(() => {
  const q = query(collection(db, "tags"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort manually (so even missing createdAt are shown)
    const sortedList = list.sort((a, b) =>
      (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
    );

    setTags(sortedList);
  });
  return () => unsubscribe();
}, []);


  // 🔹 Add new tag
  const addTag = async () => {
    if (!tagName.trim()) {
      alert("Please enter a tag name!");
      return;
    }
    try {
      await addDoc(collection(db, "tags"), {
        tagName,
        createdAt: new Date(),
      });
      setTagName("");
      alert("Tag added successfully!");
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  // 🔹 Open edit modal
  const openEditModal = (item) => {
    setEditTag(item);
    setEditName(item.tagName);
    setEditVisible(true);
  };

  // 🔹 Save edited tag
  const saveEdit = async () => {
    if (!editName.trim()) {
      alert("Tag name cannot be empty!");
      return;
    }
    try {
      await updateDoc(doc(db, "tags", editTag.id), { tagName: editName });
      setEditVisible(false);
      setEditTag(null);
      alert("Tag updated successfully!");
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  // 🔹 Delete tag
  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this tag?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteDoc(doc(db, "tags", id));
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏷 Manage Tags</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Tag Name"
        value={tagName}
        onChangeText={setTagName}
      />

      <TouchableOpacity style={styles.addButton} onPress={addTag}>
        <Text style={styles.addButtonText}>Add Tag</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>📋 Existing Tags</Text>

      <FlatList
        data={tags}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.tagName}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#4B0082" }]}
                onPress={() => openEditModal(item)}
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
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            No tags added yet.
          </Text>
        }
      />

      {/* 🔹 Edit Modal */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>✏️ Edit Tag</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter new tag name"
              value={editName}
              onChangeText={setEditName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "gray" }]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.modalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#4B0082" }]}
                onPress={saveEdit}
              >
                <Text style={styles.modalText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: { fontSize: 16, color: "#333", flex: 1 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "500" },
  // 🔹 Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#4B0082", marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalText: { color: "#fff", fontWeight: "bold" },
});
