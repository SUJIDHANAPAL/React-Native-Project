import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, addDoc, deleteDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const router = useRouter();

  // 🔹 Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.log("Error fetching product details:", error);
      }
    };
    fetchProduct();
  }, [id]);

  // 🔹 Realtime Wishlist sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      setWishlist(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Realtime Cart sync
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      setCart(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // ❤️ Toggle Wishlist
  const toggleWishlist = async () => {
    try {
      if (wishlist.includes(id)) {
        const q = query(collection(db, "wishlist"), where("productId", "==", id));
        const qSnap = await getDocs(q);
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      } else {
        await addDoc(collection(db, "wishlist"), {
          productId: id,
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
  const toggleCart = async () => {
    try {
      if (cart.includes(id)) {
        const q = query(collection(db, "cart"), where("productId", "==", id));
        const qSnap = await getDocs(q);
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
      } else {
        await addDoc(collection(db, "cart"), {
          productId: id,
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

  if (!product) {
    return (
      <View style={styles.loading}>
        <Text>Loading product details...</Text>
      </View>
    );
  }

  const isWishlisted = wishlist.includes(id);
  const isInCart = cart.includes(id);

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

        <Text style={styles.price}>₹{product.price}</Text>
        <Text style={styles.desc}>
          {product.description || "This is a beautiful product perfect for you!"}
        </Text>

        <Button
          mode="contained"
          onPress={toggleCart}
          style={[styles.button, isInCart && { backgroundColor: "#999" }]}
        >
          {isInCart ? "Added to Cart" : "Add to Cart"}
        </Button>

        <TouchableOpacity onPress={() => router.push("/auth/product/product")} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#ff3366" />
          <Text style={styles.backText}>Back to Products</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 15, backgroundColor: "#fff" },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  details: { paddingHorizontal: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 5 },
  price: { fontSize: 18, color: "#ff3366", marginBottom: 10 },
  desc: { fontSize: 15, color: "#555", marginBottom: 20 },
  button: { backgroundColor: "#ff3366", marginVertical: 10 },
  back: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  backText: { color: "#ff3366", marginLeft: 5 },
});
