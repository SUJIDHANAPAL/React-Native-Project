import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const AdminSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => setExpanded(!expanded);

  return (
    <Animated.View style={[styles.sidebar, expanded ? { width: 220 } : { width: 70 }]}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.menuIcon}>
        <Ionicons name={expanded ? "menu" : "menu-outline"} size={28} color="#fff" />
      </TouchableOpacity>

      {/* Product Section */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.sectionTitle}>🛍️ Products</Text>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.subMenu}>
            <TouchableOpacity onPress={() => router.push("/admin/AllProducts")}>
              <Text style={styles.subItem}>All Products</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/admin/Categories")}>
              <Text style={styles.subItem}>Categories</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/admin/Subcategories")}>
              <Text style={styles.subItem}>Subcategories</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/admin/Catalogue")}>
              <Text style={styles.subItem}>Catalogue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/admin/Tags")}>
              <Text style={styles.subItem}>Tags</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: "#4B0082",
    paddingTop: 40,
    height: "100%",
  },
  menuIcon: {
    alignItems: "center",
    marginBottom: 20,
  },
  section: {
    marginLeft: 10,
  },
  sectionTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  subMenu: {
    marginLeft: 20,
    marginTop: 5,
  },
  subItem: {
    color: "#fff",
    marginVertical: 5,
  },
});

export default AdminSidebar;
