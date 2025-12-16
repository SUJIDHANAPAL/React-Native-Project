import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db } from "../../firebaseConfig";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useState(new Animated.Value(-width * 0.6))[0];

  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    catalogues: 0,
    tags: 0,
    orders: 0,
    coupons: 0,
  });

  const toggleSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: isSidebarOpen ? -width * 0.6 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateTo = (path) => {
    toggleSidebar();
    router.push(path);
  };

  // Fetch counts for all collections except coupons (once)
  const fetchCounts = async () => {
    try {
      const [p, c, cat, t, o] = await Promise.all([
        getDocs(collection(db, "products")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "catalogues")),
        getDocs(collection(db, "tags")),
        getDocs(collection(db, "orders")),
      ]);

      setCounts((prev) => ({
        ...prev,
        products: p.size,
        categories: c.size,
        catalogues: cat.size,
        tags: t.size,
        orders: o.size,
      }));
    } catch (error) {
      console.log("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Live listener for coupon count
    const unsubscribe = onSnapshot(collection(db, "coupons"), (snapshot) => {
      setCounts((prev) => ({ ...prev, coupons: snapshot.size }));
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >
        <Text style={styles.sidebarTitle}>Menu</Text>

        {[
          { label: "All Products", icon: "cube-outline", path: "/admin/AddProduct" },
          { label: "Categories", icon: "list-outline", path: "/admin/Categories" },
          { label: "Subcategories", icon: "layers-outline", path: "/admin/Subcategories" },
          { label: "Catalogue", icon: "book-outline", path: "/admin/Catalogue" },
          { label: "Tags", icon: "pricetags-outline", path: "/admin/Tags" },
          { label: "Orders", icon: "cart-outline", path: "/admin/AdminOrders" },
          { label: "Coupons", icon: "ticket-outline", path: "/admin/Coupon" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigateTo(item.path)}
          >
            <Ionicons name={item.icon} size={20} color="#fff" />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome Admin 👋</Text>
        <Text style={styles.subText}>Here’s your store overview</Text>

        <View style={styles.cardContainer}>
          <DashboardCard icon="cube-outline" label="Products" value={counts.products} color="#7B61FF" />
          <DashboardCard icon="list-outline" label="Categories" value={counts.categories} color="#F9A825" />
          <DashboardCard icon="book-outline" label="Catalogues" value={counts.catalogues} color="#00BCD4" />
          <DashboardCard icon="pricetags-outline" label="Tags" value={counts.tags} color="#FF7043" />
          <DashboardCard icon="cart-outline" label="Orders" value={counts.orders} color="#66BB6A" />
          <DashboardCard icon="ticket-outline" label="Coupons" value={counts.coupons} color="#df347cff" />
        </View>
      </ScrollView>

      {/* Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleSidebar}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

// DashboardCard Component
function DashboardCard({ icon, label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={26} color={color} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9FB" },
  topBar: { height: 60, backgroundColor: "#4B0082", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, marginTop:30 },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  sidebar: { position: "absolute", left: 0, top: 0, bottom: 0, width: width * 0.6, backgroundColor: "#4B0082", paddingTop: 70, paddingHorizontal: 15, zIndex: 10 },
  sidebarTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  menuItem: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  menuText: { color: "#fff", marginLeft: 10, fontSize: 15 },
  mainContent: { padding: 20, alignItems: "center" },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: "#4B0082", marginBottom: 5 },
  subText: { fontSize: 16, color: "#666", marginBottom: 15 },
  cardContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
  card: { width: "47%", backgroundColor: "#fff", borderRadius: 12, padding: 15, marginVertical: 8, borderLeftWidth: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  cardLabel: { fontSize: 15, color: "#333", marginTop: 5 },
  cardValue: { fontSize: 22, fontWeight: "bold", marginTop: 4 },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.3)" },
});
