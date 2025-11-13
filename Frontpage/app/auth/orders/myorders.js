import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, Card, ActivityIndicator, Button } from "react-native-paper";
import { db } from "../../../firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Realtime fetch orders
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ❌ Cancel order
  const cancelOrder = async (orderId, orderStatus) => {
    if (orderStatus === "Cancelled") {
      Alert.alert("Info", "This order is already cancelled.");
      return;
    }

    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              const orderRef = doc(db, "orders", orderId);
              await updateDoc(orderRef, { orderStatus: "Cancelled" });
              Alert.alert("Success", "Order has been cancelled.");
            } catch (error) {
              console.error("Error cancelling order:", error);
              Alert.alert("Error", "Failed to cancel order.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff3366" />
        <Text>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>My Orders</Text>

      {orders.length === 0 ? (
        <Text style={styles.empty}>You have not placed any orders yet.</Text>
      ) : (
        orders.map((order) => (
          <Card key={order.id} style={styles.card}>
            <Text style={styles.orderId}>Order ID: {order.id}</Text>
            <Text style={styles.label}>Name: {order.name}</Text>
            <Text style={styles.label}>Phone: {order.phone}</Text>
            <Text style={styles.label}>Address: {order.address}</Text>
            <Text style={styles.label}>Payment: {order.payment}</Text>

            <View style={styles.divider} />

            <Text style={styles.subheading}>Items:</Text>
            {order.cartItems?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={{ flex: 1 }}>{item.name}</Text>
                <Text>₹{item.price}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <Text style={styles.total}>Total: ₹{order.totalAmount}</Text>
            <Text style={styles.status}>
              Status:{" "}
              <Text
                style={{
                  color:
                    order.orderStatus === "Cancelled" ? "red" : "#007bff",
                  fontWeight: "600",
                }}
              >
                {order.orderStatus}
              </Text>
            </Text>

            {/* ❌ Cancel Button */}
            {order.orderStatus !== "Cancelled" && (
              <Button
                mode="outlined"
                textColor="#ff3366"
                style={styles.cancelBtn}
                onPress={() => cancelOrder(order.id, order.orderStatus)}
              >
                Cancel Order
              </Button>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
};

export default MyOrders;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#ff3366",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    backgroundColor: "#fafafa",
  },
  orderId: { fontSize: 14, color: "#888", marginBottom: 6 },
  subheading: { fontWeight: "600", marginTop: 6, marginBottom: 6 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  total: { fontWeight: "bold", fontSize: 16, marginTop: 8 },
  status: { marginTop: 4, fontSize: 14 },
  label: { fontSize: 14, color: "#333" },
  empty: { textAlign: "center", color: "#777", fontSize: 16, marginTop: 40 },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cancelBtn: { marginTop: 10, borderColor: "#ff3366" },
});
