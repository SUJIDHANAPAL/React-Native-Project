import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Alert } from "react-native";
import { Text, Button, Card, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function AddressEdit() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null); // track editing address

  const router = useRouter();

  const userId = auth.currentUser?.uid;

  // 🔥 Load addresses real-time
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

  // 🔥 Save or Update Address
  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Not Logged In", "Please login to save an address.");
      return;
    }

    if (!name || !phone || !address || !pincode || !city || !state) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    try {
      if (editingId) {
        // 🟡 UPDATE ADDRESS
        await updateDoc(doc(db, "users", userId, "addresses", editingId), {
          name,
          phone,
          address,
          pincode,
          city,
          state,
        });
        Alert.alert("Updated", "Address updated successfully!");
      } else {
        // 🟢 ADD NEW ADDRESS
        const docRef = await addDoc(collection(db, "users", userId, "addresses"), {
          name,
          phone,
          address,
          pincode,
          city,
          state,
          createdAt: Date.now(),
        });
        console.log("Address saved with ID:", docRef.id);
        Alert.alert("Success", "Address saved!");
      }

      // clear form
      setName("");
      setPhone("");
      setAddress("");
      setPincode("");
      setCity("");
      setState("");
      setEditingId(null);

    } catch (error) {
      console.error("Save Address Error:", error);
      Alert.alert("Error", "Failed to save address: " + error.message);
    }
  };

  // 🔥 Load selected address into form for EDIT
  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setPhone(item.phone);
    setAddress(item.address);
    setPincode(item.pincode);
    setCity(item.city);
    setState(item.state);
  };

  // 🔥 Delete address
  const handleDelete = async (id) => {
    Alert.alert("Confirm", "Delete this address?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!userId) return;
          await deleteDoc(doc(db, "users", userId, "addresses", id));
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Manage Address</Text>

      {/* 🔹 Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="number-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Full Address"
        value={address}
        onChangeText={setAddress}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode"
        keyboardType="number-pad"
        value={pincode}
        onChangeText={setPincode}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />

      <TextInput
        style={styles.input}
        placeholder="State"
        value={state}
        onChangeText={setState}
      />

      <Button
        mode="contained"
        buttonColor="#ff3366"
        style={styles.saveBtn}
        onPress={handleSave}
      >
        {editingId ? "Update Address" : "Save Address"}
      </Button>

      {/* 🔥 Saved Address List */}
      <Text style={styles.savedTitle}>Saved Addresses</Text>

      {savedAddresses.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 10, color: "#777" }}>
          No saved addresses
        </Text>
      )}

      {savedAddresses.map((item) => (
        <Card key={item.id} style={styles.addressCard}>
          <Card.Content>
            <Text style={styles.addressText}>{item.name}</Text>
            <Text style={styles.addressText}>{item.phone}</Text>
            <Text style={styles.addressText}>{item.address}</Text>
            <Text style={styles.addressText}>
              {item.city}, {item.state} - {item.pincode}
            </Text>

            <View style={styles.actionRow}>
              <IconButton icon="pencil" size={20} onPress={() => handleEdit(item)} />
              <IconButton
                icon="delete"
                size={20}
                iconColor="red"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, marginTop:20, },
  input: {
    borderWidth: 1, borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  saveBtn: { marginTop: 10, borderRadius: 8 },
  savedTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
  addressCard: { marginBottom: 12, borderRadius: 10, elevation: 2 },
  addressText: { fontSize: 14, marginBottom: 3 },
  actionRow: { flexDirection: "row", marginTop: 10 },
});
