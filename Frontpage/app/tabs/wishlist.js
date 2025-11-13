import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  Alert,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);

  // ✅ Real-time wishlist updates
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

  // ❌ Remove from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const q = query(collection(db, "wishlist"), where("productId", "==", productId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "wishlist", docSnap.id));
      });

      ToastAndroid.show("Removed from wishlist 💔", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // 🛒 Move item to cart and remove from wishlist
  const moveToCart = async (item) => {
    try {
      // Add item to cart collection
      await addDoc(collection(db, "cart"), {
        productId: item.productId || item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        discountPrice: item.discountPrice || null,
        rating: item.rating || 0,
        quantity: 1,
        addedAt: new Date(),
      });

      // Remove it from wishlist
      await removeFromWishlist(item.productId || item.id);

      ToastAndroid.show("Moved to cart 🛒", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error moving item to cart:", error);
      Alert.alert("Error", "Unable to move item to cart.");
    }
  };

  // 🖼 Render wishlist item
  const renderItem = ({ item }) => {
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;

    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: item.image }} style={styles.image} />

          <View style={styles.details}>
            <Text style={styles.title}>{item.name}</Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.discountPrice}>
                ₹{hasDiscount ? item.discountPrice : item.price}
              </Text>
              {hasDiscount && <Text style={styles.oldPrice}>₹{item.price}</Text>}
            </View>

            {item.rating ? (
              <Text style={styles.rating}>⭐ {item.rating}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={() => moveToCart(item)}
              style={styles.cartButton}
            >
              Add to Cart
            </Button>
          </View>

          <TouchableOpacity
            onPress={() => removeFromWishlist(item.productId || item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {wishlist.length === 0 ? (
        <Text style={styles.empty}>💖 Your wishlist is empty</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  card: { marginBottom: 10, borderRadius: 10, elevation: 2, padding: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  discountPrice: { color: "#ff3366", fontWeight: "bold", marginRight: 6 },
  oldPrice: {
    color: "#888",
    textDecorationLine: "line-through",
    fontSize: 13,
  },
  rating: { fontSize: 12, color: "#555", marginTop: 3 },
  cartButton: {
    marginTop: 8,
    backgroundColor: "#ff3366",
    borderRadius: 8,
    height: 36,
  },
  empty: { fontSize: 18, textAlign: "center", color: "#666", marginTop: 40 },
});
