import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // ✅ Fetch wishlist items directly from "wishlist" collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(items);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Remove item from wishlist
  const removeFromWishlist = async (id) => {
    try {
      await deleteDoc(doc(db, "wishlist", id));
      console.log("🗑️ Item removed from wishlist!");
    } catch (error) {
      console.error("❌ Error removing item:", error);
    }
  };

  // ✅ Render wishlist items
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Card.Content>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </Card.Content>

      <Card.Actions style={{ justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={() => removeFromWishlist(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <Text style={styles.empty}>❤️ Your wishlist is empty</Text>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    color: "#ff3366",
    marginTop: 4,
  },
  empty: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  },
});
