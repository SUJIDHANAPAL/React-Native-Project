import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Card, Button, Avatar, useTheme } from "react-native-paper";
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

const categories = [
  { id: 1, name: "Women", img: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
  { id: 2, name: "Men", img: "https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg" },
  { id: 3, name: "Kids", img: "https://images.pexels.com/photos/1619697/pexels-photo-1619697.jpeg" },
  { id: 4, name: "Shoes", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPLSu-_o3HVm6Sibc8y1RQtsY0oXK3UmMnWqoJac9KCbhCpYA8pNztgOQ&s" },
  { id: 5, name: "Accessories", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2grI_f50heLYIjlC-tQbJKWI_LT42BEcVTaMf4rTCwHFzxSWqW3Mjv7c&s" },
];

const trendingProducts = [
  {
    id: 1,
    name: "Stylish Watch",
    price: "₹999",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
  },
  {
    id: 2,
    name: "Leather Wallet",
    price: "₹499",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
  },
  {
    id: 3,
    name: "Sneakers",
    price: "₹1,299",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
  },
];

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const [wishlistIds, setWishlistIds] = useState([]);
  const wishlistRef = collection(db, "wishlist");

  // ✅ Real-time wishlist listener
  useEffect(() => {
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.data().productId);
      setWishlistIds(ids);
    });
    return () => unsubscribe();
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
        name: product.name,
        image: product.img,
        price: product.price,
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
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, "wishlist", docSnap.id));
      });
      Alert.alert("Removed from Wishlist 💔");
    } catch (error) {
      console.error("Error removing wishlist item:", error);
    }
  };

  // Toggle Wishlist
  const toggleWishlist = (product) => {
    if (wishlistIds.includes(product.id)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: "#fff" }} showsVerticalScrollIndicator={false}>
      {/* Header */}
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

      {/* 🔍 Search Bar (Clickable to go to Product.js) */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push("/auth/product/product")}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={18} color="#999" />
        <Text style={styles.searchPlaceholder}>Search for products</Text>
      </TouchableOpacity>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Avatar.Image size={55} source={{ uri: item.img }} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        )}
      />

      {/* Offer Banner */}
      <Card style={styles.bannerCard}>
        <View style={styles.sliderContainer}>
          <Swiper autoplay autoplayTimeout={3} showsPagination dotColor="#ccc" activeDotColor="#ff3366">
            <Image source={{ uri: "https://img.freepik.com/free-vector/fashion-sale-banner-template_23-2148981144.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-vector/summer-sale-background-with-beach-elements_52683-15402.jpg" }} style={styles.slideImage} />
            <Image source={{ uri: "https://img.freepik.com/free-photo/young-woman-shopping_23-2148010159.jpg" }} style={styles.slideImage} />
          </Swiper>
        </View>
      </Card>

      {/* Trending Products */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Trending Products
        </Text>
        <FlatList
          horizontal
          data={trendingProducts}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isWishlisted = wishlistIds.includes(item.id);
            return (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/auth/product/productdetails",
                    params: {
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.img,
                      description: "Stylish and trendy product from our latest collection.",
                    },
                  })
                }
              >
                <View style={styles.productCard}>
                  <Image source={{ uri: item.img }} style={styles.productImage} />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.heartIcon}
                    onPress={() => toggleWishlist(item)}
                  >
                    <Ionicons
                      name={isWishlisted ? "heart" : "heart-outline"}
                      size={24}
                      color={isWishlisted ? "#ff3366" : "#777"}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Sale Banner */}
      <Card style={styles.saleBanner}>
        <Image
          source={{ uri: "https://img.freepik.com/free-vector/flat-sale-background-with-photo_23-2149006712.jpg" }}
          style={styles.saleImage}
        />
      </Card>

      {/* New Arrivals */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>New Arrivals</Text>
        <Card style={styles.arrivalCard}>
          <Card.Cover source={{ uri: "https://indian-retailer.s3.ap-south-1.amazonaws.com/s3fs-public/inline-images/W_Image%2002.jpg" }} />
          <Card.Content>
            <Text>Summer Collection</Text>
            <Button textColor="#ff3366">Explore</Button>
          </Card.Content>
        </Card>
      </View>

      {/* Sponsored Banner */}
      <Card style={styles.sponsoredCard}>
        <Card.Cover
          source={{ uri: "https://www.westside.com/cdn/shop/articles/summer_casuals_for_men_by_wes_c.png?v=1646466676" }}
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>UP TO 50% OFF</Text>
        </View>
      </Card>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, paddingTop: 50, paddingBottom: 8 },
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
  productPrice: { color: "#ff3366", fontWeight: "bold" },
  heartIcon: { position: "absolute", top: 8, right: 8, backgroundColor: "#fff", borderRadius: 20, padding: 5, elevation: 3 },
  saleBanner: { marginTop: 15, marginHorizontal: 15, borderRadius: 12, overflow: "hidden" },
  saleImage: { width: "100%", height: 120 },
  arrivalCard: { borderRadius: 12 },
  sponsoredCard: { padding: 12 },
  overlay: { position: "absolute", bottom: 0, width: "100%", backgroundColor: "rgba(0,0,0,0.5)", padding: 10 },
  overlayText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
