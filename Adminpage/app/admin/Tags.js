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

export default function Tags() {
  const [tagName, setTagName] = useState("");
  const [tags, setTags] = useState([]);

  // 🔹 Real-time listener for tags
  useEffect(() => {
    const q = query(collection(db, "tags"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTags(list);
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
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            No tags added yet.
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
  itemText: { fontSize: 16, color: "#333" },
});
