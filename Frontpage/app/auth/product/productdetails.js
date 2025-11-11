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
  const { id, name, price, discountPrice, rating, image, description, type } =
    useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  // ✅ Always load product from Firestore first
useEffect(() => {
  if (!id) return;
  let unsubscribe;

  const loadProduct = () => {
    const docRef = doc(db, "products", id);
    unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        console.log("🔥 Product data:", data); // debug log

        const p = Number(data.price) || 0;
        const dp = Number(data.discountPrice) || 0;
        const rt =
          data.rating !== undefined && data.rating !== null
            ? Number(data.rating)
            : 0;

        setProduct({
          id: snap.id,
          name: data.name || "Unknown Product",
          description:
            data.description || "Beautiful product perfect for you!",
          image: data.image || "",
          price: p,
          discountPrice: dp > 0 && dp < p ? dp : p,
          rating: rt,
        });
      } else {
        // Fallback: use local values (for trending or dummy data)
        const parsedPrice = Number(price) || 0;
        const parsedDiscount = Number(discountPrice) || 0;
        const parsedRating = rating ? Number(rating) : 0;

        setProduct({
          id,
          name: name || "Unnamed Product",
          price: parsedPrice,
          discountPrice:
            parsedDiscount > 0 && parsedDiscount < parsedPrice
              ? parsedDiscount
              : parsedPrice,
          rating: parsedRating,
          image,
          description: description || "Beautiful product perfect for you!",
        });
      }
    });
  };

  loadProduct();
  return () => unsubscribe && unsubscribe();
}, [id]);


  // 🧡 Real-time Wishlist & Cart
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

  if (!product)
    return (
      <View style={styles.loading}>
        <Text>Loading product details...</Text>
      </View>
    );

  // 💰 Price & Discount
  const hasValidDiscount =
    product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const displayPrice = hasValidDiscount
    ? product.discountPrice
    : product.price;

  const discountPercent = hasValidDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  // 🧡 Wishlist Toggle
  const toggleWishlist = async () => {
    try {
      if (wishlist.includes(product.id)) {
        const q = query(
          collection(db, "wishlist"),
          where("productId", "==", product.id)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
        Alert.alert("💔 Removed from Wishlist");
      } else {
        await addDoc(collection(db, "wishlist"), {
          productId: product.id,
          ...product,
        });
        Alert.alert("❤️ Added to Wishlist");
      }
    } catch (err) {
      console.log("❌ Error updating wishlist:", err);
    }
  };

  // 🛒 Cart Toggle
  const toggleCart = async () => {
    try {
      if (cart.includes(product.id)) {
        const q = query(
          collection(db, "cart"),
          where("productId", "==", product.id)
        );
        const snap = await getDocs(q);
        snap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
        Alert.alert("🛒 Removed from Cart");
      } else {
        await addDoc(collection(db, "cart"), {
          productId: product.id,
          ...product,
          quantity: 1,
        });
        Alert.alert("✅ Added to Cart");
      }
    } catch (err) {
      console.log("❌ Error updating cart:", err);
    }
  };

  const isWishlisted = wishlist.includes(product.id);
  const isInCart = cart.includes(product.id);

  // ⭐ Render stars visually
  const renderStars = (ratingValue) => {
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

        {/* ⭐ Rating Section */}
        <View style={styles.ratingRow}>
          {renderStars(product.rating)}
          <Text style={styles.ratingText}>
            {product.rating ? product.rating.toFixed(1) : "0.0"} / 5
          </Text>
        </View>

        {/* 💰 Price Section */}
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

        <Button
          mode="contained"
          onPress={toggleCart}
          style={[styles.button, isInCart && { backgroundColor: "#999" }]}
        >
          {isInCart ? "Added to Cart" : "Add to Cart"}
        </Button>

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
  image: { width: "100%", height: 260, borderRadius: 10, marginBottom: 15 },
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
  discountPrice: { fontSize: 22, color: "#ff3366", fontWeight: "bold" },
  originalPrice: {
    fontSize: 16,
    color: "#888",
    textDecorationLine: "line-through",
  },
  offText: { fontSize: 15, color: "green", fontWeight: "600" },
  noDiscount: { fontSize: 14, color: "#777" },
  desc: { fontSize: 15, color: "#555", marginBottom: 20 },
  button: { backgroundColor: "#ff3366", marginVertical: 10 },
  back: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  backText: { color: "#ff3366", marginLeft: 5 },
});
