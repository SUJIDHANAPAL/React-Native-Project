import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [products, setProducts] = useState([]);
  const [catalogues, setCatalogues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [selectedCatalogue, setSelectedCatalogue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [newTag, setNewTag] = useState("");
  const [newCatalogue, setNewCatalogue] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // 🔹 Fetch data
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubCatalogues = onSnapshot(collection(db, "catalogues"), (snapshot) => {
      setCatalogues(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubTags = onSnapshot(collection(db, "tags"), (snapshot) => {
      setTags(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubProducts();
      unsubCatalogues();
      unsubCategories();
      unsubTags();
    };
  }, []);

  // 🔹 Add or update product
  const addOrUpdateProduct = async () => {
    if (!name || !price || !image || !selectedCatalogue || !selectedCategory) {
      alert("⚠️ Please fill all fields.");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), {
          name,
          price: parseFloat(price),
          image,
          description,
          catalogue: selectedCatalogue,
          category: selectedCategory,
          tags: selectedTags,
        });
        Alert.alert("✅ Success", "Product updated successfully!");
      } else {
        await addDoc(collection(db, "products"), {
          name,
          price: parseFloat(price),
          image,
          description,
          catalogue: selectedCatalogue,
          category: selectedCategory,
          tags: selectedTags,
          createdAt: new Date(),
        });
        Alert.alert("✅ Success", "Product added successfully!");
      }

      resetForm();
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setImage("");
    setDescription("");
    setSelectedCatalogue("");
    setSelectedCategory("");
    setSelectedTags([]);
    setShowForm(false);
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    Alert.alert("🗑️ Deleted", "Product deleted successfully!");
  };

  const editProduct = (item) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setImage(item.image);
    setDescription(item.description);
    setSelectedCatalogue(item.catalogue || "");
    setSelectedCategory(item.category || "");
    setSelectedTags(item.tags || []);
    setShowForm(true);
  };

  const toggleTag = (tagName) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  // 🔹 Add new catalogue / category / tag manually
  const addNewItem = async (type) => {
    try {
      let value = "";
      let collectionName = "";

      if (type === "tag") {
        value = newTag.trim();
        collectionName = "tags";
        if (!value) return;
        await addDoc(collection(db, collectionName), { tagName: value });
        setNewTag("");
      } else if (type === "catalogue") {
        value = newCatalogue.trim();
        collectionName = "catalogues";
        if (!value) return;
        await addDoc(collection(db, collectionName), { catalogueName: value });
        setNewCatalogue("");
      } else if (type === "category") {
        value = newCategory.trim();
        collectionName = "categories";
        if (!value) return;
        await addDoc(collection(db, collectionName), { categoryName: value });
        setNewCategory("");
      }

      Alert.alert("✅ Added", `${type} added successfully!`);
    } catch (e) {
      Alert.alert("❌ Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShowForm(!showForm);
          if (!showForm) setEditingId(null);
        }}
        style={{
          marginBottom: 10, marginTop:25,
          backgroundColor: editingId ? "#FFA726" : "#6200ee",
        }}
      >
        {showForm ? (editingId ? "✏️ Update Product" : "➖ Hide Add Product") : "➕ Add Product"}
      </Button>

      {showForm && (
        <View style={styles.formContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            {editingId ? "Update Product" : "Add Product"}
          </Text>

          <TextInput label="Product Name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
          <TextInput label="Image URL" value={image} onChangeText={setImage} style={styles.input} />
          <TextInput label="Description" value={description} onChangeText={setDescription} multiline style={styles.input} />

          {/* 🟢 Add Category Section */}
          <View style={styles.pickerContainer}>
            <Text style={styles.sectionTitle}>Select / Add Category</Text>
            <Picker selectedValue={selectedCategory} onValueChange={(v) => setSelectedCategory(v)} style={styles.picker}>
              <Picker.Item label="-- Choose Category --" value="" />
              {categories.map((item) => (
                <Picker.Item key={item.id} label={item.categoryName || item.name} value={item.categoryName || item.name} />
              ))}
            </Picker>
            <View style={styles.inlineRow}>
              <TextInput
                placeholder="New category"
                value={newCategory}
                onChangeText={setNewCategory}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />
              <Button mode="outlined" onPress={() => addNewItem("category")}>
                + Add
              </Button>
            </View>
          </View>

          {/* 🟢 Add Catalogue Section */}
          <View style={styles.pickerContainer}>
            <Text style={styles.sectionTitle}>Select / Add Catalogue</Text>
            <Picker selectedValue={selectedCatalogue} onValueChange={(v) => setSelectedCatalogue(v)} style={styles.picker}>
              <Picker.Item label="-- Choose Catalogue --" value="" />
              {catalogues.map((item) => (
                <Picker.Item key={item.id} label={item.catalogueName || item.name} value={item.catalogueName || item.name} />
              ))}
            </Picker>
            <View style={styles.inlineRow}>
              <TextInput
                placeholder="New catalogue"
                value={newCatalogue}
                onChangeText={setNewCatalogue}
                style={[styles.input, { flex: 1, marginRight: 8 }]}
              />
              <Button mode="outlined" onPress={() => addNewItem("catalogue")}>
                + Add
              </Button>
            </View>
          </View>

          {/* 🟢 Add Tag Section */}
          <Text style={styles.sectionTitle}>Select / Add Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.tagName);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.tag, selected && styles.tagSelected]}
                  onPress={() => toggleTag(tag.tagName)}
                >
                  <Text style={{ color: selected ? "#fff" : "#333" }}>{tag.tagName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.inlineRow}>
            <TextInput
              placeholder="New tag"
              value={newTag}
              onChangeText={setNewTag}
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />
            <Button mode="outlined" onPress={() => addNewItem("tag")}>
              + Add
            </Button>
          </View>

          <Button
            mode="contained"
            onPress={addOrUpdateProduct}
            style={{ backgroundColor: editingId ? "#FFA726" : "#6200ee" }}
          >
            {editingId ? "Update Product" : "Add Product"}
          </Button>
        </View>
      )}

      <Text variant="titleLarge" style={styles.subtitle}>
        📦 Product List
      </Text>

      {products.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Cover source={{ uri: item.image }} style={styles.image} />
          <Card.Content>
            <Text variant="titleMedium">{item.name}</Text>
            <Text>💰 Rs. {item.price}</Text>
            <Text>🗂️ Catalogue: {item.catalogue}</Text>
            <Text>📁 Category: {item.category}</Text>
            <Text>🏷️ Tags: {item.tags?.join(", ")}</Text>
            <Text>{item.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => editProduct(item)}>Edit</Button>
            <Button textColor="red" onPress={() => deleteProduct(item.id)}>
              Delete
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  formContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  title: { textAlign: "center", marginBottom: 10, color: "#6200ee", fontWeight: "bold" },
  subtitle: { marginTop: 20, marginBottom: 10 },
  input: { marginBottom: 10 },
  pickerContainer: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },
  picker: { height: 55 },
  sectionTitle: { fontWeight: "bold", marginBottom: 5 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  tag: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
  },
  tagSelected: {
    backgroundColor: "#6200ee",
    borderColor: "#6200ee",
  },
  inlineRow: { flexDirection: "row", alignItems: "center" },
  card: { marginBottom: 15, borderRadius: 10, elevation: 3 },
  image: { height: 150 },
});
