import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, Card, Button, IconButton } from "react-native-paper";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser?.uid || "guest"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(list);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await updateDoc(docRef, { read: true });
    } catch (error) {
      console.log("Error marking as read:", error);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={[styles.card, !item.read && styles.unreadCard]}>
      <Card.Title title={item.title} right={() => 
        !item.read && <IconButton icon="check" onPress={() => markAsRead(item.id)} />
      }/>
      <Card.Content>
        <Text>{item.message}</Text>
        <Text style={styles.timestamp}>{item.timestamp?.toDate().toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotif}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  card: { marginBottom: 12 },
  unreadCard: { backgroundColor: "#e3f2fd" },
  timestamp: { fontSize: 12, color: "#888", marginTop: 5 },
  noNotif: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#666" },
});
