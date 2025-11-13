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
  { id: 4, name: "Shoes", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPLSu-_o3HVm6Sibc8y1RQtsY0oXK3UmMnWqoJac9KCbhCpYA8pNztgOQ&s" },
  { id: 5, name: "Accessories", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2grI_f50heLYIjlC-tQbJKWI_LT42BEcVTaMf4rTCwHFzxSWqW3Mjv7c&s" },
];

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [wishlistIds, setWishlistIds] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const wishlistRef = collection(db, "wishlist");

  // ❤️ Real-time wishlist listener
  useEffect(() => {
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().productId);
      setWishlistIds(ids);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 Fetch Trending Products
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(collection(db, "products"), where("catalogueName", "==", "Trending"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrendingProducts(data);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  // ❤️ Add to Wishlist
  const addToWishlist = async (product) => {
    try {
      const q = query(wishlistRef, where("productId", "==", product.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        Alert.alert("Already in Wishlist ❤️");
        return;
      }
      await addDoc(wishlistRef, {
        productId: product.id,
        name: product.name || product.productName || "Unnamed Product",
        image: product.image,
        price: product.price,
        discountPrice: product.discountPrice || null,
        rating: product.rating || 4.0,
      });
      Alert.alert("Added to Wishlist ❤️");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  // 💔 Remove from Wishlist
  const removeFromWishlist = async (product) => {
    try {
      const q = query(wishlistRef, where("productId", "==", product.id));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, "wishlist", docSnap.id));
      }
      Alert.alert("Removed from Wishlist 💔");
    } catch (error) {
      console.error("Error removing wishlist item:", error);
    }
  };

  // 🔄 Toggle Wishlist
  const toggleWishlist = (product) => {
    if (wishlistIds.includes(product.id)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
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
          <Ionicons name="menu-outline" size={26} color="#333" />
        </TouchableOpacity>

        <Text variant="titleLarge" style={{ fontWeight: "bold", color: "#ff3366" }}>
          Stylish Studio
        </Text>

        <TouchableOpacity onPress={() => router.push("/tabs/profile")}>
          <Avatar.Image
            size={40}
            source={{ uri: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" }}
          />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push("/auth/product/product")}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={18} color="#999" />
        <Text style={styles.searchPlaceholder}>Search for products</Text>
      </TouchableOpacity>

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
      onPress={() =>
        router.push({
          pathname: "/auth/product/categoryProducts",
          params: { category: item.name },
        })
      }
    >
      <Avatar.Image size={55} source={{ uri: item.img }} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  )}
/>

      {/* 🎉 Offer Banner */}
      <Card style={styles.bannerCard}>
        <View style={styles.sliderContainer}>
          <Swiper autoplay autoplayTimeout={3} showsPagination dotColor="#ccc" activeDotColor="#ff3366">
            <Image source={{ uri: "https://img.freepik.com/free-vector/fashion-sale-banner-template_23-2148981144.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-vector/summer-sale-background-with-beach-elements_52683-15402.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-photo/young-woman-shopping_23-2148010159.jpg" }} style={styles.slideImage} />
          </Swiper>
        </View>
      </Card>

      {/* 🔥 Trending Products */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Trending Products
        </Text>

        <FlatList
          horizontal
          data={trendingProducts}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isWishlisted = wishlistIds.includes(item.id);
            const hasDiscount =
              item.discountPrice && item.discountPrice < item.price;
            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/auth/product/productdetails",
                    params: { id: item.id, type: "trending" },
                  })
                }
              >
                <View style={styles.productCard}>
                  <Image source={{ uri: item.image }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name || item.productName}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          source={{ uri: "https://img.freepik.com/free-vector/flat-sale-background-with-photo_23-2149006712.jpg" }}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
    marginHorizontal: 15,
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 25,
  },
  searchPlaceholder: { color: "#999", fontSize: 15, marginLeft: 5 },
  categoryList: { paddingHorizontal: 15, paddingBottom: 10 },
  categoryItem: { alignItems: "center", marginRight: 20 },
  categoryText: { marginTop: 5, fontSize: 12 },
  bannerCard: { marginHorizontal: 15, marginBottom: 10, borderRadius: 12, overflow: "hidden" },
  sliderContainer: { height: 200, width: "100%", justifyContent: "center", alignSelf: "center" },
  slideImage: { width: "100%", height: "100%", borderRadius: 12 },
  section: { marginTop: 15, paddingHorizontal: 15 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10 },
  productCard: { width: 150, marginRight: 12, backgroundColor: "#fdf1f4", borderRadius: 12, padding: 8, position: "relative" },
  productImage: { width: "100%", height: 120, borderRadius: 10 },
  productInfo: { marginTop: 8 },
  productName: { fontSize: 14, fontWeight: "600", color: "#333" },
  discountPrice: { color: "#ff3366", fontWeight: "bold", marginRight: 5 },
  oldPrice: { color: "#888", textDecorationLine: "line-through", fontSize: 12 },
  rating: { fontSize: 12, color: "#555", marginTop: 3 },
  heartIcon: { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 20, padding: 5, elevation: 3 },
  saleBanner: { marginTop: 15, marginHorizontal: 15, borderRadius: 12, overflow: "hidden" },
  saleImage: { width: "100%", height: 120 },
});
