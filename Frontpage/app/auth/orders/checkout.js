import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, TextInput, Button, RadioButton, Card, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { auth, db } from "../../../firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
  orderBy,
} from "firebase/firestore";

const Checkout = () => {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [coupon, setCoupon] = useState("");
  const [payment, setPayment] = useState("COD");
  const [finalTotal, setFinalTotal] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const userId = auth.currentUser?.uid;

  // -------------------------------
  // Fetch cart items
  // -------------------------------
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cart"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCartItems(items);
    });
    return () => unsubscribe();
  }, []);

  // -------------------------------
  // Fetch saved addresses
  // -------------------------------
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "addresses"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedAddresses(list);
    });

    return unsubscribe;
  }, [userId]);

  // -------------------------------
  // Recalculate total
  // -------------------------------
  useEffect(() => {
    const newTotal = cartItems.reduce((sum, item) => {
      const priceToUse = item.discountPrice ? item.discountPrice : item.price;
      return sum + priceToUse * (item.quantity || 1);
    }, 0);
    setFinalTotal(newTotal);
  }, [cartItems]);

  const increaseQty = async (index) => {
    const item = cartItems[index];
    const ref = doc(db, "cart", item.id);
    await updateDoc(ref, { quantity: (item.quantity || 1) + 1 });
  };

  const decreaseQty = async (index) => {
    const item = cartItems[index];
    if ((item.quantity || 1) === 1) return;
    const ref = doc(db, "cart", item.id);
    await updateDoc(ref, { quantity: item.quantity - 1 });
  };

  // -------------------------------
  // Apply coupon
  // -------------------------------
  const applyCoupon = async () => {
    if (couponApplied) return Alert.alert("Coupon Already Used");

    if (!coupon) return Alert.alert("Enter Coupon", "Please enter a coupon code");

    const userCode = coupon.trim().toUpperCase();
    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", userCode),
        where("active", "==", true)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return Alert.alert("❌ Invalid Coupon", "Coupon does not exist or is inactive");

      const couponData = snapshot.docs[0].data();
      const discount = couponData.discount;
      setFinalTotal(finalTotal - (finalTotal * discount) / 100);
      setCouponApplied(true);

      Alert.alert("🎉 Coupon Applied!", `You received ${discount}% OFF`);
    } catch (err) {
      console.log("Coupon Error:", err);
      Alert.alert("Error", "Something went wrong while applying coupon");
    }
  };

  // -------------------------------
  // Clear cart
  // -------------------------------
  const clearCart = async () => {
    const snapshot = await getDocs(collection(db, "cart"));
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "cart", docSnap.id))
    );
    await Promise.all(deletePromises);
  };

  // -------------------------------
  // Place order
  // -------------------------------
  const placeOrder = async () => {
    if (!name || !address || !phone) return Alert.alert("Missing Info", "Please fill all fields");

    try {
      await addDoc(collection(db, "orders"), {
        name,
        address,
        phone,
        payment,
        cartItems,
        totalAmount: finalTotal,
        couponApplied,
        orderStatus: "Placed",
        createdAt: serverTimestamp(),
      });

      await clearCart();
      Alert.alert("Order Placed 🎉", "Your order has been placed!");
    } catch (error) {
      console.log("Order Error:", error);
      Alert.alert("Error", "Could not place your order");
    }
  };

  const shopMore = () => router.push("/auth/product/product");

  // -------------------------------
  // Select existing address
  // -------------------------------
  const selectAddress = (item) => {
    setSelectedAddressId(item.id);
    setName(item.name);
    setPhone(item.phone);
    setAddress(`${item.address}, ${item.city}, ${item.state} - ${item.pincode}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {/* -------------------------- */}
      {/* Saved Addresses */}
      {/* -------------------------- */}
      {savedAddresses.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.subheading}>Select Existing Address</Text>
          {savedAddresses.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => selectAddress(item)}
              style={[
                styles.addressCard,
                selectedAddressId === item.id && styles.selectedAddress,
              ]}
            >
              <Text style={styles.addressText}>{item.name}</Text>
              <Text style={styles.addressText}>{item.phone}</Text>
              <Text style={styles.addressText}>{item.address}</Text>
              <Text style={styles.addressText}>
                {item.city}, {item.state} - {item.pincode}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* -------------------------- */}
      {/* Billing Address */}
      {/* -------------------------- */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Billing Address</Text>
        <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
        <TextInput label="Address" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} multiline />
        <TextInput label="Phone Number" value={phone} onChangeText={setPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} />
      </Card>

      {/* -------------------------- */}
      {/* Order Summary */}
      {/* -------------------------- */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Order Summary</Text>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => {
            const priceToUse = item.discountPrice ? item.discountPrice : item.price;
            return (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                  <Text>₹{priceToUse}</Text>
                </View>
                <View style={styles.qtyControl}>
                  <IconButton icon="minus" size={18} onPress={() => decreaseQty(index)} />
                  <Text style={{ marginHorizontal: 8 }}>{item.quantity || 1}</Text>
                  <IconButton icon="plus" size={18} onPress={() => increaseQty(index)} />
                </View>
                <Text style={styles.priceText}>₹{(priceToUse * (item.quantity || 1)).toFixed(2)}</Text>
              </View>
            );
          })
        ) : (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>🛒 Your cart is empty</Text>
        )}
        <View style={styles.itemRow}>
          <Text style={{ flex: 1, fontWeight: "bold" }}>Total:</Text>
          <Text style={{ fontWeight: "bold" }}>₹{finalTotal.toFixed(2)}</Text>
        </View>
      </Card>

      {/* -------------------------- */}
      {/* Coupon */}
      {/* -------------------------- */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Apply Coupon</Text>
        <View style={styles.row}>
          <TextInput placeholder="Enter coupon code" value={coupon} onChangeText={setCoupon} style={[styles.input, { flex: 1 }]} />
          <Button mode="contained" onPress={applyCoupon} disabled={couponApplied} style={{ marginLeft: 10 }}>
            {couponApplied ? "Applied" : "Apply"}
          </Button>
        </View>
      </Card>

      {/* -------------------------- */}
      {/* Payment */}
      {/* -------------------------- */}
      <Card style={styles.card}>
        <Text style={styles.subheading}>Payment Method</Text>
        <RadioButton.Group value={payment} onValueChange={setPayment}>
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

      {cartItems.length > 0 ? (
        <Button mode="contained" onPress={placeOrder} style={styles.orderButton}>Place My Order</Button>
      ) : (
        <Button mode="contained" onPress={shopMore} style={styles.shopMoreButton}>🛍️ Shop More</Button>
      )}
    </ScrollView>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 26, fontWeight: "bold", marginBottom: 16, color: "#ff3366" },
  subheading: { fontSize: 18, fontWeight: "600", marginBottom: 10, color: "#333" },
  card: { marginBottom: 16, padding: 16, borderRadius: 12, backgroundColor: "#fff", elevation: 3 },
  input: { marginBottom: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  qtyControl: { flexDirection: "row", alignItems: "center", backgroundColor: "#f2f2f2", borderRadius: 8, paddingHorizontal: 4 },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  priceText: { width: 60, textAlign: "right" },
  orderButton: { backgroundColor: "#ff3366", paddingVertical: 12, borderRadius: 10, marginBottom: 30, elevation: 2 },
  shopMoreButton: { backgroundColor: "#4caf50", paddingVertical: 12, borderRadius: 10, marginBottom: 30, elevation: 2 },
  addressCard: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  selectedAddress: { borderColor: "#ff3366", borderWidth: 2 },
  addressText: { fontSize: 14, marginBottom: 2, color: "#333" },
});
