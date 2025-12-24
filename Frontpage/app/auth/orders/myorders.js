import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Button,
  Portal,
  Dialog,
  RadioButton,
} from "react-native-paper";
import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  where,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const ACTION_REASONS = [
  "Ordered by mistake",
  "Found cheaper elsewhere",
  "Delivery taking too long",
  "Changed my mind",
  "Other",
];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [actionType, setActionType] = useState(""); // cancel | return

  useEffect(() => {
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid)
      );

      unsubscribeOrders = onSnapshot(
        q,
        (snap) => {
          const list = snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort(
              (a, b) =>
                (b.createdAt?.seconds || 0) -
                (a.createdAt?.seconds || 0)
            );
          setOrders(list);
          setLoading(false);
        },
        () => {
          setOrders([]);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const openDialog = (orderId, type) => {
    setSelectedOrderId(orderId);
    setSelectedReason("");
    setActionType(type);
    setVisible(true);
  };

  const submitRequest = async () => {
    const order = orders.find((o) => o.id === selectedOrderId);

    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason");
      return;
    }

    try {
      if (actionType === "cancel") {
        if (order.orderStatus?.toLowerCase() !== "placed") {
          Alert.alert("Cannot cancel", "This order cannot be cancelled");
          return;
        }

        await updateDoc(doc(db, "orders", selectedOrderId), {
          orderStatus: "Cancel Requested",
          cancelReason: selectedReason,
          cancelRequestedAt: serverTimestamp(),
        });
      }

      if (actionType === "return") {
        if (order.orderStatus?.toLowerCase() !== "delivered") {
          Alert.alert("Cannot return", "This order cannot be returned");
          return;
        }

        await updateDoc(doc(db, "orders", selectedOrderId), {
          orderStatus: "Return Requested",
          returnReason: selectedReason,
          returnRequestedAt: serverTimestamp(),
        });
      }

      setVisible(false);
      Alert.alert("Success", `${actionType} request sent`);
    } catch (err) {
      Alert.alert("Error", "Request failed");
    }
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
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>My Orders</Text>

        {orders.length === 0 ? (
          <Text style={styles.empty}>
            You have not placed any orders yet.
          </Text>
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
                  <Text>{item.name}</Text>
                  <Text>₹{item.price}</Text>
                </View>
              ))}

              <View style={styles.divider} />
              <Text style={styles.total}>
                Total: ₹{order.totalAmount}
              </Text>

              <Text style={styles.status}>
                Status:{" "}
                <Text style={{ fontWeight: "600" }}>
                  {order.orderStatus}
                </Text>
              </Text>

              {order.orderStatus?.toLowerCase() === "placed" && (
                <Button
                  mode="outlined"
                  textColor="#ff3366"
                  style={styles.cancelBtn}
                  onPress={() => openDialog(order.id, "cancel")}
                >
                  Request Cancel
                </Button>
              )}

              {order.orderStatus?.toLowerCase() === "delivered" && (
                <Button
                  mode="outlined"
                  textColor="#ff3366"
                  style={styles.cancelBtn}
                  onPress={() => openDialog(order.id, "return")}
                >
                  Request Return
                </Button>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      {/* ---------- DIALOG ---------- */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>
            {actionType === "cancel" ? "Cancel Order" : "Return Order"}
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={setSelectedReason}
              value={selectedReason}
            >
              {ACTION_REASONS.map((reason) => (
                <View
                  key={reason}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 4,
                  }}
                >
                  <RadioButton value={reason} />
                  <Text>{reason}</Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Close</Button>
            <Button onPress={submitRequest}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
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
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#fafafa",
  },
  orderId: { fontSize: 13, color: "#777", marginBottom: 6 },
  label: { fontSize: 14, marginBottom: 4, color: "#333" },
  subheading: { fontWeight: "600", marginBottom: 6, marginTop: 6 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  total: { fontWeight: "bold", fontSize: 16, marginTop: 8 },
  status: { marginTop: 6, fontSize: 14 },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  cancelBtn: { marginTop: 10, borderColor: "#ff3366" },
});
