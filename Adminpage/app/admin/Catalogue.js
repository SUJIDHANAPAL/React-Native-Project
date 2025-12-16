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
} from "firebase/firestore";

export default function Catalogue() {
  const [catalogueName, setCatalogueName] = useState("");
  const [description, setDescription] = useState("");
  const [catalogues, setCatalogues] = useState([]);

  // For Edit Modal
  const [editVisible, setEditVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // 🔹 Real-time listener for catalogues
  useEffect(() => {
    const q = collection(db, "catalogues");
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sorted = items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setCatalogues(sorted);
    });

    return () => unsub();
  }, []);

  // 🔹 Add new catalogue
  const addCatalogue = async () => {
    if (!catalogueName.trim()) {
      alert("Please enter a catalogue name!");
      return;
    }

    try {
      await addDoc(collection(db, "catalogues"), {
        catalogueName,
        description,
        createdAt: new Date(),
      });
      setCatalogueName("");
      setDescription("");
      alert("Catalogue added successfully!");
    } catch (error) {
      console.error("Error adding catalogue:", error);
    }
  };

  // 🔹 Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item);
    setEditName(item.catalogueName);
    setEditDesc(item.description || "");
    setEditVisible(true);
  };

  // 🔹 Save edited catalogue
  const saveEdit = async () => {
    if (!editName.trim()) {
      alert("Catalogue name cannot be empty!");
      return;
    }
    try {
      await updateDoc(doc(db, "catalogues", editItem.id), {
        catalogueName: editName,
        description: editDesc,
      });
      setEditVisible(false);
      setEditItem(null);
      alert("Catalogue updated successfully!");
    } catch (error) {
      console.error("Error updating catalogue:", error);
    }
  };

  // 🔹 Delete catalogue
  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this catalogue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteDoc(doc(db, "catalogues", id));
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Manage Catalogue</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Catalogue Name"
        value={catalogueName}
        onChangeText={setCatalogueName}
      />

      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.addButton} onPress={addCatalogue}>
        <Text style={styles.addButtonText}>Add Catalogue</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>📋 Existing Catalogues</Text>

      <FlatList
        data={catalogues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.catalogueName}</Text>
              {item.description ? (
                <Text style={styles.itemDesc}>{item.description}</Text>
              ) : null}
            </View>

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
            No catalogues added yet.
          </Text>
        }
      />

      {/* 🔹 Edit Modal */}
      <Modal visible={editVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>✏️ Edit Catalogue</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter new catalogue name"
              value={editName}
              onChangeText={setEditName}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Enter new description"
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
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
  header: { fontSize: 22, fontWeight: "bold", color: "#4B0082", marginBottom: 20, marginTop:25 },
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
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemDesc: { fontSize: 14, color: "#555", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionText: { color: "#fff", fontSize: 14, fontWeight: "500" },

  // 🔹 Modal styles
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
