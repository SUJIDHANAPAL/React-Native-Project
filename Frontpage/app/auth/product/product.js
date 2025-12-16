import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Keyboard,
  Modal,
  ScrollView,
} from "react-native";
import { Text, Card, Button, Checkbox, RadioButton } from "react-native-paper";
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

  // Sort & Filter
  const [sortType, setSortType] = useState(null);
  const [sortVisible, setSortVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(null);
  const [onlyDiscount, setOnlyDiscount] = useState(false);

  // Price options
  const priceOptions = [
    { label: "Under ₹500", min: 0, max: 499 },
    { label: "₹500 - ₹999", min: 500, max: 999 },
    { label: "₹1000 - ₹1999", min: 1000, max: 1999 },
    { label: "₹2000+", min: 2000, max: 999999 },
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(list);
        setFilteredProducts(list);
      } catch (e) {
        console.log(e);
      }
    };
    fetchProducts();
  }, []);

  // Reset filters/search on screen focus
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

  // Wishlist & Cart realtime
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

  // Apply search + sort + filter
  useEffect(() => {
    let data = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.catalogue?.toLowerCase().includes(q)
      );
    }

    // Filter categories
    if (selectedCategories.length > 0)
      data = data.filter((p) => selectedCategories.includes(p.category));

    // Filter price
    if (selectedPriceRange)
      data = data.filter(
        (p) =>
          p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
      );

    // Filter discount
    if (onlyDiscount)
      data = data.filter((p) => p.discountPrice && p.discountPrice < p.price);

    // Sort
    if (sortType === "LOW_HIGH") data.sort((a, b) => a.price - b.price);
    else if (sortType === "HIGH_LOW") data.sort((a, b) => b.price - a.price);
    else if (sortType === "DISCOUNT")
      data.sort((a, b) => (b.price - b.discountPrice || 0) - (a.price - a.discountPrice || 0));

    setFilteredProducts(data);
  }, [
    products,
    searchQuery,
    sortType,
    selectedCategories,
    selectedPriceRange,
    onlyDiscount,
  ]);

  // Wishlist toggle
  const toggleWishlist = async (p) => {
    const q = query(collection(db, "wishlist"), where("productId", "==", p.id));
    const snap = await getDocs(q);
    if (!snap.empty) snap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
    else
      await addDoc(collection(db, "wishlist"), {
        productId: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || 0,
        image: p.image,
      });
  };

  // Cart toggle
  const toggleCart = async (p) => {
    const q = query(collection(db, "cart"), where("productId", "==", p.id));
    const snap = await getDocs(q);
    if (!snap.empty) snap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
    else
      await addDoc(collection(db, "cart"), {
        productId: p.id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice || 0,
        image: p.image,
        quantity: 1,
      });
  };

  // Render product
  const renderItem = ({ item }) => {
    const isWishlisted = wishlist.includes(item.id);
    const isInCart = cart.includes(item.id);
    const hasDiscount = item.discountPrice && item.discountPrice < item.price;

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/auth/product/productdetails", params: item })
          }
        >
          <Image source={{ uri: item.image }} style={styles.image} />
        </TouchableOpacity>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.discountPrice}>
              ₹{hasDiscount ? item.discountPrice : item.price}
            </Text>
            {hasDiscount && <Text style={styles.originalPrice}>₹{item.price}</Text>}
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

  // Get unique categories
  const categoriesList = [...new Set(products.map((p) => p.category))];

  return (
    <View style={styles.container}>
      {/* Home-style Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Flipkart-style Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topOption} onPress={() => setSortVisible(true)}>
          <Ionicons name="swap-vertical" size={18} color="#333" />
          <Text style={styles.topText}>Sort</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.topOption} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={18} color="#333" />
          <Text style={styles.topText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <Text style={styles.noProductText}>No products found</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      )}

      {/* Sort Modal */}
      <Modal visible={sortVisible} transparent animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <Button onPress={() => setSortType("LOW_HIGH")}>Price: Low to High</Button>
          <Button onPress={() => setSortType("HIGH_LOW")}>Price: High to Low</Button>
          <Button onPress={() => setSortType("DISCOUNT")}>Discount</Button>
          <Button mode="contained" onPress={() => setSortVisible(false)}>Apply</Button>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal visible={filterVisible} transparent animationType="slide">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Filter By</Text>

          {/* Category List */}
          <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Category</Text>
          {categoriesList.map((cat) => (
            <View key={cat} style={{ flexDirection: "row", alignItems: "center" }}>
              <Checkbox
                status={selectedCategories.includes(cat) ? "checked" : "unchecked"}
                onPress={() => {
                  if (selectedCategories.includes(cat)) {
                    setSelectedCategories(selectedCategories.filter((c) => c !== cat));
                  } else {
                    setSelectedCategories([...selectedCategories, cat]);
                  }
                }}
              />
              <Text>{cat}</Text>
            </View>
          ))}

          {/* Price Range */}
          <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Price Range</Text>
          <RadioButton.Group
            onValueChange={(val) =>
              setSelectedPriceRange(priceOptions.find((p) => p.label === val))
            }
            value={selectedPriceRange?.label || ""}
          >
            {priceOptions.map((p) => (
              <RadioButton.Item key={p.label} label={p.label} value={p.label} />
            ))}
          </RadioButton.Group>

          {/* Discount Only */}
          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
            <Checkbox
              status={onlyDiscount ? "checked" : "unchecked"}
              onPress={() => setOnlyDiscount(!onlyDiscount)}
            />
            <Text>Discount Only</Text>
          </View>

          <Button mode="contained"  onPress={() => setFilterVisible(false)} >Apply</Button>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    marginTop: 40,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, paddingVertical: 0 },
  topBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  topOption: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    gap: 6,
  },
  topText: { fontSize: 14, fontWeight: "500", color: "#333" },
  separator: { width: 1, backgroundColor: "#ddd" },
  card: { flex: 1, margin: 5, backgroundColor: "#fff", borderRadius: 12, elevation: 4, padding: 8 },
  image: { width: "100%", height: 130, borderRadius: 10, marginBottom: 8 },
  info: { alignItems: "center" },
  name: { fontWeight: "bold", fontSize: 14, color: "#333" },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  discountPrice: { fontSize: 15, color: "#ff3366", fontWeight: "bold" },
  originalPrice: { fontSize: 13, color: "#888", textDecorationLine: "line-through" },
  actions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  button: { backgroundColor: "#ff3366" },
  noProductText: { textAlign: "center", marginTop: 20, color: "#666" },
  modal: { position: "absolute", bottom: 0, width: "100%", maxHeight: "80%", backgroundColor: "#fff", padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

export default ProductScreen;
