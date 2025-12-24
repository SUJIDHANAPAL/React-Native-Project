import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch all orders
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(orderData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔔 Send notification
  const sendNotification = async (userId, title, message) => {
    if (!userId) return;

    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      read: false,
      createdAt: serverTimestamp(),
    });
  };

  // 📝 Update order status
  const updateStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      let updateData = { orderStatus: newStatus };

      // ⏱ timestamps
      if (newStatus === "DELIVERED") {
        updateData.deliveredAt = serverTimestamp();
      }

      if (newStatus === "CANCELLED") {
        updateData.cancelledAt = serverTimestamp();
      }

      if (newStatus === "RETURN_APPROVED") {
        updateData.returnApprovedAt = serverTimestamp();
      }

      if (newStatus === "RETURN_REJECTED") {
        updateData.returnRejectedAt = serverTimestamp();
      }

      await updateDoc(doc(db, "orders", orderId), updateData);

      // 🔔 Notifications
      switch (newStatus) {
        case "CANCELLED":
          await sendNotification(
            order.userId,
            "Order Cancelled",
            `Your order ${orderId} has been cancelled.`
          );
          break;

        case "CANCEL_REJECTED":
          await sendNotification(
            order.userId,
            "Cancel Rejected",
            `Your cancellation request for order ${orderId} was rejected.`
          );
          break;

        case "RETURN_APPROVED":
          await sendNotification(
            order.userId,
            "Return Approved",
            `Your return request for order ${orderId} has been approved.`
          );
          break;

        case "RETURN_REJECTED":
          await sendNotification(
            order.userId,
            "Return Rejected",
            `Your return request for order ${orderId} was rejected.`
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Status update error:", error);
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
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No orders found
        </Text>
      ) : (
        orders.map((order) => (
          <Card key={order.id} style={styles.card}>
            <Text style={styles.name}>{order.name}</Text>
            <Text style={styles.detail}>📞 {order.phone}</Text>
            <Text style={styles.detail}>🏠 {order.address}</Text>
            <Text style={styles.detail}>💳 Payment: {order.payment}</Text>
            <Text style={styles.detail}>
              🛍 Items: {order.cartItems?.length}
            </Text>
            <Text style={styles.total}>💰 ₹{order.totalAmount}</Text>

            <View style={styles.statusRow}>
              <Text style={{ fontWeight: "600" }}>Status:</Text>
              <Chip style={styles.statusChip}>{order.orderStatus}</Chip>
            </View>

            {/* 🔴 CANCEL REQUEST */}
            {order.orderStatus === "Cancel Requested" && (
              <>
                <Text style={styles.cancelReason}>
                  ❗ Reason: {order.cancelReason}
                </Text>

                <View style={styles.actions}>
                  <Button
                    mode="contained"
                    buttonColor="#ff3366"
                    onPress={() => updateStatus(order.id, "CANCELLED")}
                  >
                    Approve Cancel
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() => updateStatus(order.id, "CANCEL_REJECTED")}
                  >
                    Reject
                  </Button>
                </View>
              </>
            )}

            {/* 🔵 RETURN REQUEST */}
            {order.orderStatus === "Return Requested" && (
              <>
                <Text style={styles.cancelReason}>
                  🔁 Reason: {order.returnReason}
                </Text>

                <View style={styles.actions}>
                  <Button
                    mode="contained"
                    buttonColor="#ff3366"
                    onPress={() =>
                      updateStatus(order.id, "RETURN_APPROVED")
                    }
                  >
                    Approve Return
                  </Button>

                  <Button
                    mode="outlined"
                    onPress={() =>
                      updateStatus(order.id, "RETURN_REJECTED")
                    }
                  >
                    Reject
                  </Button>
                </View>
              </>
            )}

            {/* 🟢 NORMAL FLOW */}
            {order.orderStatus === "Placed" && (
              <View style={styles.actions}>
                <Button
                  mode="outlined"
                  onPress={() => updateStatus(order.id, "SHIPPED")}
                >
                  Ship
                </Button>

                <Button
                  mode="outlined"
                  onPress={() => updateStatus(order.id, "DELIVERED")}
                >
                  Deliver
                </Button>
              </View>
            )}
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
    marginTop: 25,
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
  },
  statusChip: { marginLeft: 8, backgroundColor: "#ffe6ea" },
  cancelReason: {
    marginTop: 6,
    fontSize: 14,
    color: "#d32f2f",
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
