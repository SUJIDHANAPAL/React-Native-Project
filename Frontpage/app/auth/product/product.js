// app/auth/product/product.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { Text, Card, Button, Checkbox, RadioButton, Badge } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [sortType, setSortType] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  const cartAnim = useRef(new Animated.Value(1)).current;

  const priceOptions = [
    { label: "Under ₹500", min: 0, max: 499 },
    { label: "₹500 - ₹999", min: 500, max: 999 },
    { label: "₹1000 - ₹1999", min: 1000, max: 1999 },
    { label: "₹2000+", min: 2000, max: 999999 },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
      setFilteredProducts(list);
    };
    fetchProducts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setSortType(null);
      setSelectedCategories([]);
      setSelectedPriceRange(null);
      setOnlyDiscount(false);
      setSearchQuery("");
      setFilteredProducts(products);
    }, [products])
  );

  useEffect(() => {
    const unsubW = onSnapshot(collection(db, "wishlist"), (snap) =>
      setWishlist(snap.docs.map((d) => d.data().productId))
    );
    const unsubC = onSnapshot(collection(db, "cart"), (snap) =>
      setCart(snap.docs.map((d) => d.data().productId))
    );
    return () => {
      unsubW();
      unsubC();
    };
  }, []);

  useEffect(() => {
    let data = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      data = data.filter((p) =>
        selectedCategories.includes(p.category?.trim())
      );
    }

    if (selectedPriceRange) {
      data = data.filter(
        (p) =>
          p.price >= selectedPriceRange.min &&
          p.price <= selectedPriceRange.max
      );
    }

    if (onlyDiscount) {
      data = data.filter(
        (p) => p.discountPrice && p.discountPrice < p.price
      );
    }

    if (sortType === "LOW_HIGH") data.sort((a, b) => a.price - b.price);
    if (sortType === "HIGH_LOW") data.sort((a, b) => b.price - a.price);
    if (sortType === "DISCOUNT")
      data.sort(
        (a, b) =>
          (b.price - (b.discountPrice || b.price)) -
          (a.price - (a.discountPrice || a.price))
      );

    setFilteredProducts(data);
  }, [
    products,
    searchQuery,
    sortType,
    selectedCategories,
    selectedPriceRange,
    onlyDiscount,
  ]);

  const toggleWishlist = async (p) => {
    const q = query(collection(db, "wishlist"), where("productId", "==", p.id));
    const snap = await getDocs(q);
    if (!snap.empty)
      snap.forEach((d) => deleteDoc(doc(db, "wishlist", d.id)));
    else
      addDoc(collection(db, "wishlist"), {
        productId: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || 0,
        image: p.image,
      });
  };

  const animateCart = () => {
    Animated.sequence([
      Animated.timing(cartAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
      Animated.timing(cartAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  const toggleCart = async (p) => {
    const q = query(collection(db, "cart"), where("productId", "==", p.id));
    const snap = await getDocs(q);
    if (!snap.empty)
      snap.forEach((d) => deleteDoc(doc(db, "cart", d.id)));
    else {
      addDoc(collection(db, "cart"), {
        productId: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || 0,
        image: p.image,
        quantity: 1,
      });
      animateCart(); // animate cart badge
    }
  };

  const renderItem = ({ item }) => {
    const isWishlisted = wishlist.includes(item.id);
    const isInCart = cart.includes(item.id);
    const hasDiscount =
      item.discountPrice && item.discountPrice < item.price;

    return (
      <Card style={styles.card}>
        <View style={styles.imageWrapper}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/auth/product/productdetails",
                params: item,
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => toggleWishlist(item)}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={18}
              color={isWishlisted ? "#ff3366" : "#333"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.discountPrice}>
              ₹{hasDiscount ? item.discountPrice : item.price}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₹{item.price}</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
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

  const categoriesList = [
    ...new Set(products.map((p) => p.category?.trim()).filter(Boolean)),
  ];

  return (
    <View style={styles.container}>
      {/* SEARCH BAR + CART ICON */}
      <View style={styles.searchCartRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.cartIcon}
          onPress={() => router.push("/tabs/addtocart")}
        >
          <Animated.View style={{ transform: [{ scale: cartAnim }] }}>
            <Ionicons name="cart-outline" size={28} color="#333" />
            {cart.length > 0 && (
              <Badge style={styles.cartBadge}>{cart.length}</Badge>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Sort / Filter */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topOption}
          onPress={() => setSortVisible(true)}
        >
          <Ionicons name="swap-vertical" size={18} />
          <Text style={styles.topText}>Sort</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.topOption}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={18} />
          <Text style={styles.topText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* SORT MODAL */}
      <Modal visible={sortVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <Button onPress={() => setSortType("LOW_HIGH")}>Price: Low to High</Button>
          <Button onPress={() => setSortType("HIGH_LOW")}>Price: High to Low</Button>
          <Button onPress={() => setSortType("DISCOUNT")}>Discount</Button>
          <Button
            mode="contained"
            style={{ width: "100%" }}
            onPress={() => setSortVisible(false)}
          >
            Apply
          </Button>
        </View>
      </Modal>

      {/* FILTER MODAL */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Filter By</Text>

          <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Category</Text>
          {categoriesList.map((cat) => (
            <View key={cat} style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={selectedCategories.includes(cat) ? "checked" : "unchecked"}
                onPress={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev, cat]
                  )
                }
              />
              <Text>{cat}</Text>
            </View>
          ))}

          <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Price Range</Text>
          <RadioButton.Group
            value={selectedPriceRange?.label || ""}
            onValueChange={(val) =>
              setSelectedPriceRange(priceOptions.find((p) => p.label === val))
            }
          >
            {priceOptions.map((p) => (
              <RadioButton.Item key={p.label} label={p.label} value={p.label} />
            ))}
          </RadioButton.Group>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Checkbox
              status={onlyDiscount ? "checked" : "unchecked"}
              onPress={() => setOnlyDiscount(!onlyDiscount)}
            />
            <Text>Discount Only</Text>
          </View>

          <Button
            mode="contained"
            style={{ width: "100%", marginTop: 10 }}
            onPress={() => setFilterVisible(false)}
          >
            Apply
          </Button>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },

  searchCartRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 10,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 1,
    flex: 1,
    marginRight: 10,
    marginBottom:2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15, // increased placeholder and text size
  
  },

  cartIcon: { position: "relative" },

  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff3366",
    color: "#fff",
  },

  topBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },

  topOption: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    gap: 6,
  },

  topText: { fontSize: 14, fontWeight: "500" },

  separator: { width: 1, backgroundColor: "#ddd" },

  card: {
    width: "48%",
    minHeight: 260,
    borderRadius: 12,
    elevation: 4,
    padding: 8,
    marginBottom: 10,
  },

  imageWrapper: { position: "relative" },

  image: { width: "100%", height: 130, borderRadius: 10 },

  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  info: { alignItems: "center", marginTop: 4 },

  name: { fontWeight: "bold", fontSize: 14, minHeight: 20, textAlign: "center" },

  priceRow: { flexDirection: "row", gap: 4 },

  discountPrice: { color: "#ff3366", fontWeight: "bold" },

  originalPrice: { color: "#888", textDecorationLine: "line-through" },

  actions: { marginTop: 6 },

  button: { backgroundColor: "#ff3366" },

  modal: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

export default ProductScreen;
