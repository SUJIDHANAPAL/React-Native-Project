import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
} from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ added
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
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]); // ✅ added

  // ✅ Local Trending Products
  const trendingProducts = [
    {
      id: "t1",
      name: "Stylish Watch",
      price: "₹999",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
      description: "Trendy wrist watch perfect for daily style.",
      category: "Accessories",
      catalogue: "Watches",
    },
    {
      id: "t2",
      name: "Leather Wallet",
      price: "₹499",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
      description: "Elegant wallet made from premium leather.",
      category: "Men",
      catalogue: "Wallets",
    },
    {
      id: "t3",
      name: "Sneakers",
      price: "₹1,299",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
      description: "Comfortable sneakers for your everyday look.",
      category: "Footwear",
      catalogue: "Shoes",
    },
  ];

  // ✅ Fetch Firestore Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const firestoreProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const allProducts = [...trendingProducts, ...firestoreProducts];
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Load search history from AsyncStorage
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

  // ✅ Save history to AsyncStorage
  const saveHistory = async (updatedHistory) => {
    try {
      await AsyncStorage.setItem("searchHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.log("Error saving search history:", error);
    }
  };

  // ✅ Add new search to history
  const addToHistory = async (queryText) => {
    if (!queryText.trim()) return;
    const lower = queryText.trim().toLowerCase();
    if (searchHistory.some((q) => q.toLowerCase() === lower)) return; // avoid duplicates
    const updated = [queryText, ...searchHistory].slice(0, 10); // max 10
    setSearchHistory(updated);
    saveHistory(updated);
  };

  // ✅ Delete one item from history
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
          image: product.image || product.img || "",
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
          image: product.image || product.img || "",
          description: product.description || "No description available",
          quantity: 1,
        });
      }
    } catch (error) {
      console.log("❌ Error updating cart:", error);
    }
  };

  // 🔍 Search logic (case-insensitive)
  useEffect(() => {
    const queryText = searchQuery.toLowerCase().trim();

    if (queryText === "") {
      setFilteredProducts(products);
      setSuggestions([]);
      return;
    }

    const matched = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(queryText) ||
        p.category?.toLowerCase().includes(queryText) ||
        p.catalogue?.toLowerCase().includes(queryText)
    );

    setFilteredProducts(matched);
    setSuggestions(
      matched
        .filter((p) => p.name?.toLowerCase().startsWith(queryText))
        .slice(0, 5)
    );
  }, [searchQuery, products]);

  const handleSelectSuggestion = (name) => {
    setSearchQuery(name);
    handleSearch(name);
  };

  const handleSearch = (queryText) => {
    const lower = queryText.toLowerCase().trim();
    const matched = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower) ||
        p.catalogue?.toLowerCase().includes(lower)
    );
    setFilteredProducts(matched);
    addToHistory(queryText);
    Keyboard.dismiss();
  };

  // 🧩 Render each product card
  const renderItem = ({ item }) => {
    const isWishlisted = wishlist.includes(item.id);
    const isInCart = cart.includes(item.id);

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
          <Text style={styles.price}>{item.price}</Text>
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

  // ✅ Search toggle
  const toggleSearch = () => {
    if (searchVisible) {
      setSearchQuery("");
      setSuggestions([]);
      setFilteredProducts(products);
      Keyboard.dismiss();
    }
    setSearchVisible(!searchVisible);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Our Products</Text>
        <TouchableOpacity onPress={toggleSearch}>
          <Ionicons
            name={searchVisible ? "close" : "search"}
            size={24}
            color="#ff3366"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {searchVisible && (
        <>
          <TextInput
            style={styles.searchBar}
            placeholder="Search by name, category, or catalogue..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
          />

          {/* 🔁 Search History */}
          {searchHistory.length > 0 && (
            <View style={styles.historyContainer}>
              {searchHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <TouchableOpacity onPress={() => handleSearch(item)}>
                    <Text style={styles.historyText}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteFromHistory(item)}>
                    <Ionicons name="trash-outline" size={18} color="#888" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Product List */}
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
  historyContainer: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
    padding: 8,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  historyText: { fontSize: 15, color: "#333" },
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
  price: { color: "#ff3366", fontSize: 14, marginVertical: 4 },
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
