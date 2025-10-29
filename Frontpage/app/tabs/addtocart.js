import React, { useEffect, useState } from "react";
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";

const AddToCart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // ✅ Live cart updates
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const cartItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCart(cartItems);

      // 🔢 Calculate total price
      const sum = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
      setTotal(sum);
    });

    return () => unsubscribe();
  }, []);

  // ❌ Remove an item from cart
  const removeFromCart = async (id) => {
    await deleteDoc(doc(db, "cart", id));
  };

  // 💳 Simulate checkout
  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Cart is empty", "Add some products first!");
      return;
    }

    Alert.alert(
      "Order Confirmed 🎉",
      `Your total is ₹${total}. Thank you for shopping with us!`
    );
  };

  // 🖼 Render cart item
  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.details}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <Text style={styles.empty}>🛒 Your cart is empty</Text>
      ) : (
        <>
          <FlatList data={cart} renderItem={renderItem} keyExtractor={(item) => item.id} />

          {/* 🧾 Total + Checkout */}
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

  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    color: "#ff3366",
    fontSize: 15,
    marginTop: 4,
  },
  empty: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
    marginTop: 40,
  },
  checkoutBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#ff3366",
    borderRadius: 8,
  },
});
