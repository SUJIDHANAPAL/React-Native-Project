import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { View, Text } from "react-native";

function BadgeIcon({ icon, color, size, count }) {
  return (
    <View style={{ width: 30, alignItems: "center" }}>
      <Ionicons name={icon} color={color} size={size} />
      {count > 0 && (
        <View
          style={{
            position: "absolute",
            right: -6,
            top: -3,
            backgroundColor: "#f43f5e",
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
            {count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubWishlist = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      setWishlistCount(snapshot.size);
    });

    const unsubCart = onSnapshot(collection(db, "cart"), (snapshot) => {
      setCartCount(snapshot.size);
    });

    return () => {
      unsubWishlist();
      unsubCart();
    };
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#f43f5e",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon
              icon="heart-outline"
              color={color}
              size={size}
              count={wishlistCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="addtocart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <BadgeIcon
              icon="cart-outline"
              color={color}
              size={size}
              count={cartCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
