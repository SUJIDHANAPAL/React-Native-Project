// app/category/[category].js
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../firebaseConfig"; // adjust path if your firebaseConfig location differs
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";

export default function CategoryPage() {
  const { category } = useLocalSearchParams(); // gets value from URL: /category/Women
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products by category value
  useEffect(() => {
    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        // Firestore query where product field "category" equals the category string
        const q = query(collection(db, "products"), where("category", "==", category));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching category products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category]);

  // Add to wishlist (example)
  const addToWishlist = async (product) => {
    try {
      const ref = collection(db, "wishlist");
      await addDoc(ref, {
        productId: product.id,
        name: product.name || product.productName || "Unnamed",
        price: product.price || 0,
        discountPrice: product.discountPrice || null,
        image: product.image || null,
        createdAt: new Date(),
      });
      alert("Added to wishlist ❤️");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Failed to add to wishlist");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{category} Collection</Text>

      {products.length === 0 ? (
        <Text style={styles.empty}>No products found in this category.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/auth/product/productdetails",
                  params: { id: item.id, type: "category" },
                })
              }
            >
              <Card style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Card.Content>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.discountPrice}>
                      ₹{item.discountPrice ?? item.price}
                    </Text>
                    {item.discountPrice && <Text style={styles.oldPrice}>₹{item.price}</Text>}
                  </View>

                  {typeof item.rating === "number" && (
                    <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
                  )}
                </Card.Content>

                <TouchableOpacity
                  style={styles.heartIcon}
                  onPress={() => addToWishlist(item)}
                >
                  <Ionicons name="heart-outline" size={22} color="#ff3366" />
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  heading: { fontSize: 22, fontWeight: "bold", color: "#ff3366", marginBottom: 12 },
  card: {
    width: 160,
    backgroundColor: "#fdf1f4",
    borderRadius: 12,
    marginBottom: 16,
    padding: 8,
    elevation: 2,
    position: "relative",
  },
  image: { width: "100%", height: 120, borderRadius: 10 },
  name: { fontSize: 14, fontWeight: "600", marginTop: 6 },
  discountPrice: { color: "#ff3366", fontWeight: "bold", marginRight: 5 },
  oldPrice: { color: "#888", textDecorationLine: "line-through", fontSize: 12 },
  rating: { fontSize: 12, color: "#555", marginTop: 3 },
  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },
  empty: { textAlign: "center", color: "#777", marginTop: 50, fontSize: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
