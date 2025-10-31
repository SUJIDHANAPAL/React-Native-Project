import React, { useState, useEffect } from "react";
import { View, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

  // ✅ Local Trending Products
  const trendingProducts = [
    {
      id: "t1",
      name: "Stylish Watch",
      price: "₹999",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
      description: "Trendy wrist watch perfect for daily style.",
    },
    {
      id: "t2",
      name: "Leather Wallet",
      price: "₹499",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
      description: "Elegant wallet made from premium leather.",
    },
    {
      id: "t3",
      name: "Sneakers",
      price: "₹1,299",
      image:
        "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
      description: "Comfortable sneakers for your everyday look.",
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

        // Merge Firestore + Trending
        const allProducts = [...trendingProducts, ...firestoreProducts];
        setProducts(allProducts);
      } catch (error) {
        console.log("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Real-time Wishlist
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      setWishlist(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // ✅ Real-time Cart
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      setCart(snapshot.docs.map((doc) => doc.data().productId));
    });
    return () => unsubscribe();
  }, []);

  // ❤️ Toggle Wishlist
  const toggleWishlist = async (product) => {
    try {
      const productId = product.id;
      const q = query(collection(db, "wishlist"), where("productId", "==", productId));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        // Remove if already wishlisted
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "wishlist", d.id)));
      } else {
        // Add new wishlist item
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

  // 🛒 Toggle Cart
  const toggleCart = async (product) => {
    try {
      const productId = product.id;
      const q = query(collection(db, "cart"), where("productId", "==", productId));
      const qSnap = await getDocs(q);

      if (!qSnap.empty) {
        // Remove if already in cart
        qSnap.forEach(async (d) => await deleteDoc(doc(db, "cart", d.id)));
      } else {
        // Add new product to cart
        console.log("Adding to cart:", product);

        if (!product?.name || !product?.price) {
          console.warn("Missing product details:", product);
          return;
        }

        await addDoc(collection(db, "cart"), {
          productId,
          name: product.name,
          price: product.price,
          image: product.image || product.img || "",
          description: product.description || "No description available",
          quantity: 1,
        });

        console.log("✅ Product added to cart successfully!");
      }
    } catch (error) {
      console.log("❌ Error updating cart:", error);
    }
  };

  // 🧩 Render Product Card
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
          <Text style={styles.name}>{item.name}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Products</Text>
      {products.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>Loading products...</Text>
      ) : (
        <FlatList
          data={products}
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff3366",
    marginVertical: 10,
    textAlign: "center",
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
  name: { fontWeight: "bold", fontSize: 14, textAlign: "center", color: "#333" },
  price: { color: "#ff3366", fontSize: 14, marginVertical: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  button: { backgroundColor: "#ff3366" },
});

export default ProductScreen;
