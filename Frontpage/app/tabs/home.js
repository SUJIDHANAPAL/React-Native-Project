import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Text, Card, Avatar, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Swiper from "react-native-swiper";
import { useRouter } from "expo-router";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// 🧷 Category List
const categories = [
  { id: 1, name: "Women", img: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
  { id: 2, name: "Men", img: "https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg" },
  { id: 3, name: "Kids", img: "https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg" },
  { id: 4, name: "Accessories", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2grI_f50heLYIjlC-tQbJKWI_LT42BEcVTaMf4rTCwHFzxSWqW3Mjv7c&s" },
  { id: 5, name: "Grocery", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYaMw-u-ZguYWKEDSqsx15ECt4HkCjSEyUBEZrU0JSnSLqmjv6vpxxdJ4&s" },
];

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 SEARCH STATES
  const [searchText, setSearchText] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const wishlistRef = collection(db, "wishlist");

  // ❤️ Wishlist listener
  useEffect(() => {
    const unsub = onSnapshot(wishlistRef, snap => {
      setWishlistIds(snap.docs.map(d => d.data().productId));
    });
    return unsub;
  }, []);

  // 🔥 Trending products
  useEffect(() => {
    const fetchTrending = async () => {
      const q = query(
        collection(db, "products"),
        where("catalogueName", "==", "Trending")
      );
      const snap = await getDocs(q);
      setTrendingProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchTrending();
  }, []);

  // 🔍 Fetch all products for search
  useEffect(() => {
    const fetchAll = async () => {
      const snap = await getDocs(collection(db, "products"));
      setAllProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchAll();
  }, []);

  // 🔍 Search logic (case-insensitive, multiple fields)
  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }
    const t = searchText.toLowerCase();
    const filtered = allProducts.filter(p =>
      (p.name || p.productName || "").toLowerCase().includes(t) ||
      (p.category || "").toLowerCase().includes(t) ||
      (p.subCategory || "").toLowerCase().includes(t) ||
      (p.catalogueName || "").toLowerCase().includes(t)
    );
    setSearchResults(filtered);
  }, [searchText]);

  // ❤️ Wishlist functions
  const addToWishlist = async (product) => {
    const q = query(wishlistRef, where("productId", "==", product.id));
    const snap = await getDocs(q);
    if (!snap.empty) return Alert.alert("Already in Wishlist ❤️");

    await addDoc(wishlistRef, {
      productId: product.id,
      name: product.name || product.productName,
      image: product.image,
      price: product.price,
      discountPrice: product.discountPrice || null,
      rating: product.rating || 4,
    });
  };

  const removeFromWishlist = async (product) => {
    const q = query(wishlistRef, where("productId", "==", product.id));
    const snap = await getDocs(q);
    snap.docs.forEach(d => deleteDoc(doc(db, "wishlist", d.id)));
  };

  const toggleWishlist = (product) => {
    wishlistIds.includes(product.id)
      ? removeFromWishlist(product)
      : addToWishlist(product);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff3366" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#fff" }} showsVerticalScrollIndicator={false}>

      {/* 🧭 Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Ionicons name="menu-outline" size={26} />
        </TouchableOpacity>
        <Text variant="titleLarge" style={{ fontWeight: "bold", color: "#ff3366" }}>
          Stylish Studio
        </Text>
        <TouchableOpacity onPress={() => router.push("/tabs/profile")}>
          <Avatar.Image size={40} source={{ uri: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" }} />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          style={styles.searchPlaceholder}
          placeholder="Search for products"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* 🔍 Search Results */}
      {searchResults.length > 0 && (
        <View style={{ paddingHorizontal: 15 }}>
          {searchResults.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: "/auth/product/productdetails",
                  params: { id: item.id },
                })
              }
            >
              <Text style={{ paddingVertical: 8 }}>
                🔎 {item.name || item.productName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 🛍️ Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => router.push(`/category/${item.name}`)}
          >
            <Avatar.Image size={55} source={{ uri: item.img }} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 🎉 Slider */}
      <Card style={styles.bannerCard}>
        <View style={styles.sliderContainer}>
          <Swiper autoplay autoplayTimeout={3} showsPagination>
            <Image source={{ uri: "https://img.freepik.com/free-vector/fashion-sale-banner-template_23-2148981144.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-vector/summer-sale-background-with-beach-elements_52683-15402.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-photo/young-woman-shopping_23-2148010159.jpg" }} style={styles.slideImage} />
          </Swiper>
        </View>
      </Card>

      {/* 🔥 Trending Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Products</Text>

        <FlatList
          horizontal
          data={trendingProducts}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isWishlisted = wishlistIds.includes(item.id);
            const hasDiscount = item.discountPrice && item.discountPrice < item.price;

            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/auth/product/productdetails",
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name || item.productName}
                    </Text>

                    <View style={{ flexDirection: "row" }}>
                      <Text style={styles.discountPrice}>
                        ₹{hasDiscount ? item.discountPrice : item.price}
                      </Text>
                      {hasDiscount && (
                        <Text style={styles.oldPrice}>₹{item.price}</Text>
                      )}
                    </View>

                    {item.rating && (
                      <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => toggleWishlist(item)}
                  >
                    <Ionicons
                      name={isWishlisted ? "heart" : "heart-outline"}
                      size={22}
                      color={isWishlisted ? "#ff3366" : "#777"}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* 🏷️ Sale Banner */}
      <Card style={styles.saleBanner}>
        <Image
          source={{ uri: "https://thumbs.dreamstime.com/b/online-shopping-banner-business-concept-sale-e-commerce-smartphone-tiny-people-character-template-web-landing-147192884.jpg" }}
          style={styles.saleImage}
        />
      </Card>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems:"center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    marginBottom:10,
  },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    marginHorizontal: 15,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems:"center",
    marginBottom:20,
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    paddingVertical:0,
  },
  categoryList: { paddingHorizontal: 15 },
  categoryItem: { alignItems: "center", marginRight: 20 },
  categoryText: { marginTop: 5, fontSize: 12 },
  bannerCard: { margin: 15, borderRadius: 12, overflow: "hidden" },
  sliderContainer: { height: 200 },
  slideImage: { width: "100%", height: "100%" },
  section: { paddingHorizontal: 15, marginTop: 10 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10 },
  productCard: { width: 150, marginRight: 12, backgroundColor: "#fdf1f4", borderRadius: 12, padding: 8 },
  productImage: { width: "100%", height: 120, borderRadius: 10 },
  productInfo: { marginTop: 8 },
  productName: { fontWeight: "600" },
  discountPrice: { color: "#ff3366", fontWeight: "bold", marginRight: 5 },
  oldPrice: { textDecorationLine: "line-through", fontSize: 12 },
  rating: { fontSize: 12 },
  heartIcon: { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 20, padding: 5 },
  saleBanner: { margin: 15, borderRadius: 12, overflow: "hidden" },
  saleImage: { width: "100%", height: 120 },
});
