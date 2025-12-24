// app/auth/product/productdetail.js
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../../firebaseConfig";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // -------------------------
  // Load product
  // -------------------------
  useEffect(() => {
    if (!id) return;

    const docRef = doc(db, "products", id);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
    });

    return () => unsubscribe();
  }, [id]);

  // -------------------------
  // Wishlist & Cart listeners
  // -------------------------
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

  if (!product) {
    return (
      <View style={styles.loading}>
        <Text>Loading product details...</Text>
      </View>
    );
  }

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.includes(product.id);

  // -------------------------
  // Wishlist toggle
  // -------------------------
  const toggleWishlist = async () => {
    const q = query(
      collection(db, "wishlist"),
      where("productId", "==", product.id)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      snap.forEach((d) => deleteDoc(doc(db, "wishlist", d.id)));
    } else {
      await addDoc(collection(db, "wishlist"), {
        productId: product.id,
        ...product,
      });
    }
  };

  // -------------------------
  // Add / Remove Cart
  // -------------------------
  const toggleCart = async () => {
    const q = query(
      collection(db, "cart"),
      where("productId", "==", product.id)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      snap.forEach((d) => deleteDoc(doc(db, "cart", d.id)));
    } else {
      await addDoc(collection(db, "cart"), {
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice || null,
        image: product.image,
        quantity: 1,
      });
    }
  };

  // -------------------------
  // BUY NOW logic (TEMPORARY, do NOT add to cart)
  // -------------------------
  const handleBuyNow = () => {
    try {
      // Pass the product as a param to checkout
      router.push({
        pathname: "/auth/orders/checkout",
        params: {
          buyNowProduct: JSON.stringify({ ...product, quantity: 1 }),
        },
      });
    } catch (error) {
      console.log("Buy Now Error:", error);
      Alert.alert("Error", "Something went wrong");
    }
  };

  // -------------------------
  // Helpers
  // -------------------------
  const renderStars = (ratingValue = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= Math.floor(ratingValue) ? "star" : "star-outline"}
          size={18}
          color="#FFD700"
        />
      );
    }
    return stars;
  };

  const hasValidDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasValidDiscount
    ? product.discountPrice
    : product.price;
  const discountPercent = hasValidDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

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

        <View style={styles.ratingRow}>
          {renderStars(product.rating)}
          <Text style={styles.ratingText}>
            {product.rating?.toFixed(1) || "0.0"} / 5
          </Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.discountPrice}>₹{displayPrice}</Text>
          {hasValidDiscount ? (
            <>
              <Text style={styles.originalPrice}>₹{product.price}</Text>
              <Text style={styles.offText}>{discountPercent}% OFF</Text>
            </>
          ) : (
            <Text style={styles.noDiscount}>No discount available</Text>
          )}
        </View>

        <Text style={styles.desc}>{product.description}</Text>

        {/* ADD TO CART + BUY NOW */}
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={toggleCart}
            style={[
              styles.button,
              isInCart && { backgroundColor: "#999" },
              { flex: 1, marginRight: 5 },
            ]}
          >
            {isInCart ? "Added" : "Add to Cart"}
          </Button>

          <Button
            mode="contained"
            onPress={handleBuyNow}
            style={[styles.buyButton, { flex: 1, marginLeft: 5 }]}
          >
            Buy Now
          </Button>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color="#ff3366" />
          <Text style={styles.backText}>Back</Text>
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
    height: 260,
    borderRadius: 10,
    marginBottom: 15,
  },
  details: { paddingHorizontal: 10 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 22, fontWeight: "bold", color: "#333" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 3,
  },
  ratingText: { marginLeft: 5, fontSize: 15, color: "#555" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  discountPrice: {
    fontSize: 22,
    color: "#ff3366",
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 16,
    color: "#888",
    textDecorationLine: "line-through",
  },
  offText: { fontSize: 15, color: "green", fontWeight: "600" },
  noDiscount: { fontSize: 14, color: "#777" },
  desc: { fontSize: 15, color: "#555", marginBottom: 20 },
  buttonRow: { flexDirection: "row", marginBottom: 10 },
  button: { backgroundColor: "#ff3366" },
  buyButton: { backgroundColor: "#ff9900" },
  back: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  backText: { color: "#ff3366", marginLeft: 5 },
});
