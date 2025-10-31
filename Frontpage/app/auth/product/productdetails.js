import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import {
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

// ✅ Trending fallback
const trendingProducts = [
  {
    id: "t1",
    name: "Stylish Watch",
    price: "₹999",
    image:
      "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
    description: "Trendy wrist watch perfect for daily style.",
  },
  {
    id: "t2",
    name: "Leather Wallet",
    price: "₹499",
    image:
      "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
    description: "Elegant wallet made from premium leather.",
  },
  {
    id: "t3",
    name: "Sneakers",
    price: "₹1,299",
    image:
      "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
    description: "Comfortable sneakers for your everyday look.",
  },
];

export default function ProductDetails() {
  const { id, name, price, image, description } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (name && price && image) {
      // ✅ Product passed from params
      setProduct({ id, name, price, image, description });
    } else {
      // ✅ Fallback: find in trending or Firestore
      const local = trendingProducts.find((p) => p.id === id);
      if (local) {
        setProduct(local);
      } else {
        const fetchFirestoreProduct = async () => {
          try {
            const docRef = doc(db, "products", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
            else console.log("No product found in Firestore!");
          } catch (e) {
            console.log("Error loading product details:", e);
          }
        };
        fetchFirestoreProduct();
      }
    }
  }, [id]);

  useEffect(() => {
    const unsubWishlist = onSnapshot(collection(db, "wishlist"), (snap) =>
      setWishlist(snap.docs.map((d) => d.data().productId))
    );
    const unsubCart = onSnapshot(collection(db, "cart"), (snap) =>
      setCart(snap.docs.map((d) => d.data().productId))
    );
    return () => {
      unsubWishlist();
      unsubCart();
    };
  }, []);

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      if (wishlist.includes(product.id)) {
        const q = query(collection(db, "wishlist"), where("productId", "==", product.id));
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      } else {
        await addDoc(collection(db, "wishlist"), {
          productId: product.id,
          ...product,
        });
      }
    } catch (err) {
      console.log("Error updating wishlist:", err);
    }
  };

  const toggleCart = async () => {
    if (!product) return;
    try {
      if (cart.includes(product.id)) {
        const q = query(collection(db, "cart"), where("productId", "==", product.id));
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
      } else {
        await addDoc(collection(db, "cart"), {
          productId: product.id,
          ...product,
          quantity: 1,
        });
      }
    } catch (err) {
      console.log("Error updating cart:", err);
    }
  };

  if (!product)
    return (
      <View style={styles.loading}>
        <Text>Loading product details...</Text>
      </View>
    );

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.includes(product.id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />

      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
          <TouchableOpacity onPress={toggleWishlist}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={26}
              color={isWishlisted ? "#ff3366" : "#888"}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>{product.price}</Text>
        <Text style={styles.desc}>
          {product.description || "Beautiful product perfect for you!"}
        </Text>

        <Button
          mode="contained"
          onPress={toggleCart}
          style={[styles.button, isInCart && { backgroundColor: "#999" }]}
        >
          {isInCart ? "Added to Cart" : "Add to Cart"}
        </Button>

        <TouchableOpacity onPress={() => router.push("/tabs/home")} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#ff3366" />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 15, backgroundColor: "#fff" },
  image: { width: "100%", height: 250, borderRadius: 10, marginBottom: 15 },
  details: { paddingHorizontal: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  price: { fontSize: 18, color: "#ff3366", marginBottom: 10 },
  desc: { fontSize: 15, color: "#555", marginBottom: 20 },
  button: { backgroundColor: "#ff3366", marginVertical: 10 },
  back: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  backText: { color: "#ff3366", marginLeft: 5 },
});
