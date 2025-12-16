import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch all orders in real-time
 useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
    const orderData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOrders(orderData);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  // 📝 Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { orderStatus: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff3366" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>🧾 All Orders</Text>

      {orders.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40 }}>No orders found</Text>
      ) : (
        orders.map((order) => (
          <Card key={order.id} style={styles.card}>
            <Text style={styles.name}>{order.name}</Text>
            <Text style={styles.detail}>📞 {order.phone}</Text>
            <Text style={styles.detail}>🏠 {order.address}</Text>
            <Text style={styles.detail}>💳 Payment: {order.payment}</Text>
            <Text style={styles.detail}>🛍 Items: {order.cartItems?.length}</Text>
            <Text style={styles.total}>💰 Total: ₹{order.totalAmount}</Text>

            <View style={styles.statusRow}>
              <Text style={{ fontWeight: "600" }}>Status:</Text>
              <Chip style={styles.statusChip}>{order.orderStatus}</Chip>
            </View>

            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => updateStatus(order.id, "Shipped")}
              >
                Ship
              </Button>
              <Button
                mode="outlined"
                onPress={() => updateStatus(order.id, "Delivered")}
              >
                Deliver
              </Button>
              <Button
                mode="outlined"
                textColor="red"
                onPress={() => updateStatus(order.id, "Cancelled")}
              >
                Cancel
              </Button>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

export default AdminOrders;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop:25,
    color: "#ff3366",
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  name: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  detail: { fontSize: 14, marginBottom: 4, color: "#444" },
  total: { fontSize: 16, fontWeight: "600", marginTop: 6 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 6,
  },
  statusChip: { marginLeft: 8, backgroundColor: "#ffe6ea" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
