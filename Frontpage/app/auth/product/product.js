import React, { useState, useEffect } from "react";
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function ProductScreen() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

const trendingProducts = [
  {
    id: 1,
    name: "Stylish Watch",
    price: "₹999",
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
    description: "Trendy wrist watch perfect for daily style.",
  },
  {
    id: 2,
    name: "Leather Wallet",
    price: "₹499",
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
    description: "Elegant wallet made from premium leather.",
  },
  {
    id: 3,
    name: "Sneakers",
    price: "₹1,299",
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
    description: "Comfortable sneakers for your everyday look.",
  },
];


  // ✅ Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const list = [];
      querySnapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
      setProducts(list);
    };
    fetchProducts();
  }, []);

  // ✅ Real-time wishlist sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      const wishlistIds = snapshot.docs.map((doc) => doc.data().productId);
      setWishlist(wishlistIds);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Real-time cart sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const cartIds = snapshot.docs.map((doc) => doc.data().productId);
      setCart(cartIds);
    });
    return () => unsubscribe();
  }, []);

  // ❤️ Toggle Wishlist
  const toggleWishlist = async (product) => {
    try {
      if (wishlist.includes(product.id)) {
        const q = query(collection(db, "wishlist"), where("productId", "==", product.id));
        const qSnap = await getDocs(q);
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      } else {
        await addDoc(collection(db, "wishlist"), {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        });
      }
    } catch (error) {
      console.log("Error updating wishlist:", error);
    }
  };

  // 🛒 Toggle Cart
  const toggleCart = async (product) => {
    try {
      if (cart.includes(product.id)) {
        const q = query(collection(db, "cart"), where("productId", "==", product.id));
        const qSnap = await getDocs(q);
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
      } else {
        await addDoc(collection(db, "cart"), {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        });
      }
    } catch (error) {
      console.log("Error updating cart:", error);
    }
  };

  // 🎨 Render product card
  const renderItem = ({ item }) => {
    const isWishlisted = wishlist.includes(item.id);
    const isInCart = cart.includes(item.id);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => router.push(`/auth/product/productdetails?id=${item.id}`)}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <View style={styles.actions}>
          {/* Wishlist button */}
          <TouchableOpacity onPress={() => toggleWishlist(item)}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? "#ff3366" : "#888"}
            />
          </TouchableOpacity>

          {/* Add to cart button */}
          <Button
            mode="contained"
            onPress={() => toggleCart(item)}
            style={[styles.button, isInCart && { backgroundColor: "#999" }]}
          >
            {isInCart ? "Added" : "Add to Cart"}
          </Button>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Products</Text>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 60 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff3366",
    marginVertical: 10,
    textAlign: "center",
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 3,
    padding: 8,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  info: {
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  price: {
    color: "#ff3366",
    fontSize: 14,
    marginVertical: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#ff3366",
  },
});
