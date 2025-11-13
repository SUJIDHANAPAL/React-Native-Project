import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnim = useState(new Animated.Value(-width * 0.6))[0];

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

  return (
    <View style={styles.container}>
      {/* 🔹 Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* 🔹 Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >
        <Text style={styles.sidebarTitle}>Menu</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/AddProduct")}
        >
          <Ionicons name="cube-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>All Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/Categories")}
        >
          <Ionicons name="list-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/Subcategories")}
        >
          <Ionicons name="layers-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Subcategories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/Catalogue")}
        >
          <Ionicons name="book-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Catalogue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/Tags")}
        >
          <Ionicons name="pricetags-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Tags</Text>
        </TouchableOpacity>

         <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigateTo("/admin/AdminOrders")}
        >
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.menuText}>Orders</Text>
        </TouchableOpacity>


      </Animated.View>

      {/* 🔹 Main Content */}
      <View style={styles.mainContent}>
        <Text style={styles.welcomeText}>Welcome Admin 👋</Text>
        <Text style={styles.subText}>Select a section from the sidebar</Text>
      </View>

      {/* 🔹 Overlay */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  topBar: {
    height: 60,
    backgroundColor: "#4B0082",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.6,
    backgroundColor: "#4B0082",
    paddingTop: 70,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  sidebarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  menuText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B0082",
  },
  subText: {
    marginTop: 8,
    fontSize: 16,
    color: "#555",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
});
