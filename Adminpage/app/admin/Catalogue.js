import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  
} from "firebase/firestore";

export default function Catalogue() {
  const [catalogueName, setCatalogueName] = useState("");
  const [description, setDescription] = useState("");
  const [catalogues, setCatalogues] = useState([]);

  // 🔹 Real-time listener for catalogues

useEffect(() => {
  try {
    const q = collection(db, "catalogues"); // ✅ no orderBy
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // ✅ Sort manually (handles missing createdAt)
      const sorted = items.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setCatalogues(sorted);
    });

    return () => unsub();
  } catch (error) {
    console.error("🔥 Firestore listener error:", error);
  }
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
            <Text style={styles.itemTitle}>{item.catalogueName}</Text>
            {item.description ? (
              <Text style={styles.itemDesc}>{item.description}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            No catalogues added yet.
          </Text>
        }
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
  itemTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  itemDesc: { fontSize: 14, color: "#555", marginTop: 4 },
});
