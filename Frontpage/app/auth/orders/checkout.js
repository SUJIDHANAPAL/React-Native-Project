import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, RadioButton, Card, IconButton } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../../../firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const Checkout = () => {
  const router = useRouter();
  const { cart, total } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState(JSON.parse(cart || "[]"));

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState("COD");
  const [finalTotal, setFinalTotal] = useState(Number(total));

  // 🧮 Recalculate total whenever quantity changes
  useEffect(() => {
    const newTotal = cartItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
    setFinalTotal(newTotal);
  }, [cartItems]);

  // ➕ Increase quantity
  const increaseQty = (index) => {
    const updated = [...cartItems];
    updated[index].quantity = (updated[index].quantity || 1) + 1;
    setCartItems(updated);
  };

  // ➖ Decrease quantity
  const decreaseQty = (index) => {
    const updated = [...cartItems];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
      setCartItems(updated);
    }
  };

  // 🎟 Apply simple coupon logic
  const applyCoupon = () => {
    if (coupon.toLowerCase() === "suji10") {
      const discounted = finalTotal * 0.9;
      setFinalTotal(discounted);
      Alert.alert("Coupon Applied 🎉", "You got 10% off!");
    } else {
      Alert.alert("Invalid Coupon", "Please check your coupon code.");
    }
  };

  // 🧾 Place Order
  const placeOrder = async () => {
  if (!name || !address || !phone) {
    Alert.alert("Missing Info", "Please fill all billing details.");
    return;
  }

  try {
    console.log("🧾 Adding order to Firestore...");
    const docRef = await addDoc(collection(db, "orders"), {
      name:userName,
      address:address,
      phone:userPhone,
      payment:paymentMethod,
      cartItems:cartItems,
      totalAmount: finalTotal,
      orderStatus: "Placed",
      createdAt: serverTimestamp(),
    });
    console.log("✅ Order stored with ID:", docRef.id);

    Alert.alert("✅ Order Placed", "Your order has been placed successfully!");
    router.replace("/auth/orders/myorders");
  } catch (error) {
    console.log("❌ Error placing order:", error);
    Alert.alert("Error", "Something went wrong while placing your order.");
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {/* 🏠 Billing Details */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Billing Address</Text>
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          multiline
          style={styles.input}
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </Card>

      {/* 🛒 Order Summary */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Order Summary</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text>₹{item.price}</Text>
            </View>
            <View style={styles.qtyControl}>
              <IconButton
                icon="minus"
                size={18}
                onPress={() => decreaseQty(index)}
              />
              <Text style={{ marginHorizontal: 8, fontWeight: "600" }}>
                {item.quantity || 1}
              </Text>
              <IconButton
                icon="plus"
                size={18}
                onPress={() => increaseQty(index)}
              />
            </View>
            <Text style={{ width: 60, textAlign: "right" }}>
              ₹{(item.price * (item.quantity || 1)).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.itemRow}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Total:</Text>
          <Text style={{ fontWeight: "bold" }}>₹{finalTotal.toFixed(2)}</Text>
        </View>
      </Card>

      {/* 🎟 Coupon */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Apply Coupon</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="Enter coupon code"
            value={coupon}
            onChangeText={setCoupon}
            style={[styles.input, { flex: 1 }]}
          />
          <Button mode="contained" onPress={applyCoupon} style={{ marginLeft: 10 }}>
            Apply
          </Button>
        </View>
      </Card>

      {/* 💳 Payment Method */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Payment Method</Text>
        <RadioButton.Group onValueChange={setPayment} value={payment}>
          <View style={styles.radioRow}>
            <RadioButton value="COD" />
            <Text>Cash on Delivery</Text>
          </View>
          <View style={styles.radioRow}>
            <RadioButton value="Online" />
            <Text>Online Payment</Text>
          </View>
        </RadioButton.Group>
      </Card>

      <Button mode="contained" onPress={placeOrder} style={styles.orderButton}>
        Place My Order
      </Button>
    </ScrollView>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#ff3366" },
  subheading: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  card: { marginBottom: 16, padding: 16, borderRadius: 10 },
  input: { marginBottom: 10 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  row: { flexDirection: "row", alignItems: "center" },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  orderButton: {
    backgroundColor: "#ff3366",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 30,
  },
});
