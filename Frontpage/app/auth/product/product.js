import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const ProductScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // ✅ Fetch only Firestore Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const firestoreProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(firestoreProducts);
        setFilteredProducts(firestoreProducts);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Load search history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem("searchHistory");
        if (saved) setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.log("Error loading search history:", error);
      }
    };
    loadHistory();
  }, []);

  // ✅ Save search history
  const saveHistory = async (updatedHistory) => {
    try {
      await AsyncStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.log("Error saving search history:", error);
    }
  };

  // ✅ Add new search
  const addToHistory = async (queryText) => {
    if (!queryText.trim()) return;
    const lower = queryText.trim().toLowerCase();
    if (searchHistory.some((q) => q.toLowerCase() === lower)) return;
    const updated = [queryText, ...searchHistory].slice(0, 10);
    setSearchHistory(updated);
    saveHistory(updated);
  };

  // ✅ Delete search
  const deleteFromHistory = async (item) => {
    const updated = searchHistory.filter((q) => q !== item);
    setSearchHistory(updated);
    saveHistory(updated);
  };

  // ✅ Wishlist realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      setWishlist(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // ✅ Cart realtime
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      setCart(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // ❤️ Wishlist toggle
  const toggleWishlist = async (product) => {
    try {
      const productId = product.id;
      const q = query(collection(db, "wishlist"), where("productId", "==", productId));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      } else {
        await addDoc(collection(db, "wishlist"), {
          productId,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice || 0,
          image: product.image || "",
          description: product.description || "",
        });
      }
    } catch (error) {
      console.log("Error updating wishlist:", error);
    }
  };

  // 🛒 Cart toggle
  const toggleCart = async (product) => {
    try {
      const productId = product.id;
      const q = query(collection(db, "cart"), where("productId", "==", productId));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
      } else {
        if (!product?.name || !product?.price) return;
        await addDoc(collection(db, "cart"), {
          productId,
          name: product.name,
          price: product.price,
          discountPrice: product.discountPrice || 0,
          image: product.image || "",
          description: product.description || "No description available",
          quantity: 1,
        });
      }
    } catch (error) {
      console.log("❌ Error updating cart:", error);
    }
  };

  // 🔍 Search logic
  useEffect(() => {
    const queryText = searchQuery.toLowerCase().trim();
    if (queryText === "") {
      setFilteredProducts(products);
      return;
    }

    const matched = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(queryText) ||
        p.category?.toLowerCase().includes(queryText) ||
        p.catalogue?.toLowerCase().includes(queryText)
    );

    setFilteredProducts(matched);
  }, [searchQuery, products]);

  // 🧩 Render product card
  const renderItem = ({ item }) => {
    const isWishlisted = wishlist.includes(item.id);
    const isInCart = cart.includes(item.id);

    const hasDiscount = item.discountPrice && item.discountPrice < item.price;
    const discountedPrice = hasDiscount ? item.discountPrice : item.price;
    const discountPercent = hasDiscount
      ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
      : 0;

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/auth/product/productdetails",
              params: {
                id: item.id,
                name: item.name,
                price: item.price,
                discountPrice: item.discountPrice || 0,
                image: item.image,
                description: item.description,
              },
            })
          }
        >
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.discountPrice}>₹{discountedPrice}</Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>₹{item.price}</Text>
                <Text style={styles.offText}>{discountPercent}% OFF</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => toggleWishlist(item)}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? "#ff3366" : "#888"}
            />
          </TouchableOpacity>

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
      <View style={styles.header}>
        <Text style={styles.title}>Our Products</Text>
        <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
          <Ionicons
            name={searchVisible ? "close" : "search"}
            size={24}
            color="#ff3366"
          />
        </TouchableOpacity>
      </View>

      {searchVisible && (
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, category, or catalogue..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
      )}

      {filteredProducts.length === 0 ? (
        <Text style={styles.noProductText}>No products found</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#ff3366" },
  searchBar: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    margin: 5,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 4,
    padding: 8,
  },
  image: { width: "100%", height: 130, borderRadius: 10, marginBottom: 8 },
  info: { alignItems: "center" },
  name: { fontWeight: "bold", fontSize: 14, color: "#333" },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  discountPrice: { fontSize: 15, color: "#ff3366", fontWeight: "bold" },
  originalPrice: {
    fontSize: 13,
    color: "#888",
    textDecorationLine: "line-through",
  },
  offText: { fontSize: 12, color: "green", fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  button: { backgroundColor: "#ff3366" },
  noProductText: { textAlign: "center", marginTop: 20, color: "#666" },
});

export default ProductScreen;
