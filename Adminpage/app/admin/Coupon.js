import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Text, TextInput, Button, Card, IconButton, Switch } from "react-native-paper";
import { db } from "../../firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

const AdminCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");

  // Load coupons from Firestore
  const loadCoupons = async () => {
    try {
      console.log("Loading coupons from Firestore...");
      const snapshot = await getDocs(collection(db, "coupons"));
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      console.log("Coupons loaded:", data);
      setCoupons(data);
    } catch (error) {
      console.log("Error loading coupons:", error);
      Alert.alert("Error", "Failed to load coupons. Check console logs.");
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // Add new coupon
  const addCoupon = async () => {
    if (!code || !discount) {
      Alert.alert("Error", "Please enter coupon code and discount.");
      return;
    }

    const discountNumber = Number(discount);
    if (isNaN(discountNumber) || discountNumber <= 0) {
      Alert.alert("Error", "Discount must be a positive number.");
      return;
    }

    try {
      console.log("Attempting to add coupon:", code.toUpperCase(), discountNumber);
      const docRef = await addDoc(collection(db, "coupons"), {
        code: code.toUpperCase(),
        discount: discountNumber,
        active: true,
      });
      console.log("Coupon added successfully! Document ID:", docRef.id);
      Alert.alert("Success", `Coupon added! ID: ${docRef.id}`);
      setCode("");
      setDiscount("");
      loadCoupons(); // refresh list
    } catch (error) {
      console.log("Failed to add coupon:", error);
      Alert.alert("Error", "Failed to add coupon. Check console logs.");
    }
  };

  // Toggle coupon active status
  const toggleActive = async (item) => {
    try {
      console.log(`Toggling coupon ${item.code} active: ${!item.active}`);
      await updateDoc(doc(db, "coupons", item.id), { active: !item.active });
      setCoupons(prev =>
        prev.map(c => (c.id === item.id ? { ...c, active: !c.active } : c))
      );
      console.log("Coupon updated successfully!");
    } catch (error) {
      console.log("Error updating coupon:", error);
      Alert.alert("Error", "Failed to update coupon. Check console logs.");
    }
  };

  // Delete coupon
  const removeCoupon = async (item) => {
    try {
      console.log(`Deleting coupon ${item.code}`);
      await deleteDoc(doc(db, "coupons", item.id));
      setCoupons(prev => prev.filter(c => c.id !== item.id));
      console.log("Coupon deleted successfully!");
    } catch (error) {
      console.log("Error deleting coupon:", error);
      Alert.alert("Error", "Failed to delete coupon. Check console logs.");
    }
  };

  // Render coupon item
  const renderItem = ({ item }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: item.active ? "#fff" : "#f0f0f0" }
      ]}
    >
      <View style={styles.row}>
        <View>
          <Text style={{ fontWeight: "bold", color: item.active ? "#000" : "#888" }}>
            {item.code}
          </Text>
          <Text style={{ color: item.active ? "#000" : "#888" }}>
            {item.discount}% off
          </Text>
        </View>
        <View style={styles.actions}>
          <Switch value={item.active} onValueChange={() => toggleActive(item)} />
          <IconButton icon="delete" color="red" size={24} onPress={() => removeCoupon(item)} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Manage Coupons</Text>

      <Card style={styles.card}>
        <TextInput
          label="Coupon Code"
          value={code}
          onChangeText={setCode}
          style={styles.input}
        />
        <TextInput
          label="Discount (%)"
          value={discount}
          onChangeText={setDiscount}
          keyboardType="numeric"
          style={styles.input}
        />
        <Button mode="contained" onPress={addCoupon}>Add Coupon</Button>
      </Card>

      <FlatList
        data={coupons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};

export default AdminCoupon;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16, marginTop:25,color: "#ff3366" },
  card: { padding: 16, marginBottom: 12, borderRadius: 10 },
  input: { marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  actions: { flexDirection: "row", alignItems: "center" },
});
