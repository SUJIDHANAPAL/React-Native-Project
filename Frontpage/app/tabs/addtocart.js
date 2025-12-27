
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
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

const AddToCart = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // ✅ WAIT FOR AUTH, THEN LOAD CART
  useEffect(() => {
    let unsubscribeCart = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCart([]);
        setTotal(0);
        return;
      }

      const q = query(
        collection(db, "cart"),
        where("userId", "==", user.uid)
      );

      unsubscribeCart = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setCart(items);

        const sum = items.reduce(
          (acc, item) =>
            acc +
            (item.discountPrice ?? item.price) * (item.quantity || 1),
          0
        );

        setTotal(sum);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCart) unsubscribeCart();
    };
  }, []);

  // ❌ REMOVE ITEM
  const removeFromCart = async (productId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, "cart"),
        where("productId", "==", productId),
        where("userId", "==", user.uid)
      );

      const snap = await getDocs(q);
      snap.forEach(async (d) => {
        await deleteDoc(doc(db, "cart", d.id));
      });

      ToastAndroid.show("Removed from cart", ToastAndroid.SHORT);
    } catch (e) {
      Alert.alert("Error", "Failed to remove item");
    }
  };

  // 💳 CHECKOUT
  const handleCheckout = () => {
    if (!cart.length) {
      Alert.alert("Cart empty", "Add products first");
      return;
    }

    router.push("/auth/orders/checkout");
  };

  // 🖼 RENDER ITEM
  const renderItem = ({ item }) => {
    const price = item.discountPrice ?? item.price;

    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          <Image source={{ uri: item.image }} style={styles.image} />

          <View style={styles.details}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>₹{price}</Text>

            {item.rating ? (
              <Text style={styles.rating}>⭐ {item.rating}</Text>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => removeFromCart(item.productId)}>
            <Ionicons name="trash-outline" size={22} color="red" />
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
            <Text style={styles.total}>Total ₹{total}</Text>
            <Button
              mode="contained"
              onPress={handleCheckout}
              style={styles.checkoutBtn}
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
  card: { marginBottom: 10, borderRadius: 10, padding: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  price: { color: "#ff3366", fontWeight: "bold", marginVertical: 4 },
  rating: { fontSize: 12, color: "#555" },
  empty: { fontSize: 18, textAlign: "center", marginTop: 40 },
  checkoutBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  total: { fontSize: 18, fontWeight: "bold" },
  checkoutBtn: { backgroundColor: "#ff3366" },
});
