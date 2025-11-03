import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [selectedCatalogue, setSelectedCatalogue] = useState("");
  const [editingId, setEditingId] = useState(null);

  // ✅ Fetch products (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    });
    return unsubscribe;
  }, []);

  // ✅ Fetch catalogues for dropdown
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "catalogues"), (snapshot) => {
      const catalogueList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCatalogues(catalogueList);
    });
    return unsubscribe;
  }, []);

  // ✅ Add or Update Product
  const addOrUpdateProduct = async () => {
    if (!name || !price || !image || !selectedCatalogue) {
      alert("⚠️ Please fill all fields including catalogue");
      return;
    }

    try {
      if (editingId) {
        const docRef = doc(db, "products", editingId);
        await updateDoc(docRef, {
          name,
          price: parseFloat(price),
          image,
          description,
          catalogue: selectedCatalogue,
        });
        alert("✅ Product updated successfully!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), {
          name,
          price: parseFloat(price),
          image,
          description,
          catalogue: selectedCatalogue,
          createdAt: new Date(),
        });
        alert("✅ Product added successfully!");
      }

      // Reset fields
      setName("");
      setPrice("");
      setImage("");
      setDescription("");
      setSelectedCatalogue("");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Delete Product
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      alert("🗑️ Product deleted!");
    } catch (error) {
      alert(error.message);
    }
  };

  // ✅ Edit Product
  const editProduct = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setImage(item.image);
    setDescription(item.description);
    setSelectedCatalogue(item.catalogue || "");
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {editingId ? "Update Product" : "Add Product"}
      </Text>

      <TextInput label="Product Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
      <TextInput label="Image URL" value={image} onChangeText={setImage} style={styles.input} />
      <TextInput label="Description" value={description} onChangeText={setDescription} multiline style={styles.input} />

      {/* 🔽 Catalogue Selector */}
      <View style={styles.pickerContainer}>
        <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Select Catalogue</Text>
        <Picker
          selectedValue={selectedCatalogue}
          onValueChange={(value) => setSelectedCatalogue(value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Choose Catalogue --" value="" />
          {catalogues.map((item) => (
            <Picker.Item
              key={item.id}
              label={item.catalogueName || item.name || "Untitled"}
              value={item.catalogueName || item.name}
            />
          ))}
        </Picker>
      </View>

      <Button mode="contained" onPress={addOrUpdateProduct}>
        {editingId ? "Update Product" : "Add Product"}
      </Button>

      <Text variant="titleLarge" style={styles.subtitle}>📦 Product List</Text>

      {products.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Cover source={{ uri: item.image }} style={styles.image} />
          <Card.Content>
            <Text variant="titleMedium">{item.name}</Text>
            <Text>💰 Rs. {item.price}</Text>
            <Text>🗂️ Catalogue: {item.catalogue || "Not Assigned"}</Text>
            <Text>{item.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => editProduct(item)}>Edit</Button>
            <Button onPress={() => deleteProduct(item.id)} textColor="red">Delete</Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
    color: "#6200ee",
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  picker: {
    height: 45,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
  },
  image: {
    height: 150,
  },
});
