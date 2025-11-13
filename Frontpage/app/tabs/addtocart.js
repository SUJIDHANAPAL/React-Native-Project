import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ToastAndroid,
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
} from "firebase/firestore";
import { useRouter } from "expo-router";

const AddToCart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // ✅ Live cart updates from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCart(cartItems);

      const sum = cartItems.reduce(
        (acc, item) =>
          acc +
          (item.discountPrice ? item.discountPrice : item.price) *
            (item.quantity || 1),
        0
      );
      setTotal(sum);
    });

    return () => unsubscribe();
  }, []);

  // ❌ Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      const q = query(collection(db, "cart"), where("productId", "==", productId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert("Not found", "This item isn't in your cart.");
        return;
      }

      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "cart", docSnap.id));
      });

      ToastAndroid.show("🗑️ Item removed from cart", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  // 💳 Navigate to Checkout page with cart + total
  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Cart is empty", "Add some products first!");
      return;
    }

    // ✅ Pass cart and total to Checkout.js
    router.push({
      pathname: "/auth/orders/checkout",
      params: {
        cart: JSON.stringify(cart),
        total: total.toString(),
      },
    });
  };

  // 🖼 Render cart item
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
          </View>

          <TouchableOpacity
            onPress={() => removeFromCart(item.productId || item.id)}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.empty}>🛒 Your cart is empty</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.checkoutBox}>
            <Text style={styles.totalText}>Total: ₹{total}</Text>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutButton}
            >
              Checkout
            </Button>
          </View>
        </>
      )}
    </View>
  );
};

export default AddToCart;

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
  empty: { fontSize: 18, textAlign: "center", color: "#666", marginTop: 40 },
  checkoutBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  totalText: { fontSize: 18, fontWeight: "bold" },
  checkoutButton: { backgroundColor: "#ff3366", borderRadius: 8 },
});
