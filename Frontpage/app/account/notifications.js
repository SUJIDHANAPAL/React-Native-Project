import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, IconButton, ActivityIndicator } from "react-native-paper";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
        // ❌ orderBy removed to avoid index error
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            // ✅ manual sort by timestamp
            .sort((a, b) => {
              if (!a.timestamp) return 1;
              if (!b.timestamp) return -1;
              return b.timestamp.toDate() - a.timestamp.toDate();
            });

          setNotifications(list);
          setLoading(false);
        },
        (error) => {
          console.error("Notification fetch error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (error) {
      console.log("Error marking as read:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff3366" />
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <Text style={styles.noNotif}>No notifications</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={[styles.card, !item.read && styles.unreadCard]}>
              <Card.Title
                title={item.title}
                right={() =>
                  !item.read && (
                    <IconButton
                      icon="check"
                      onPress={() => markAsRead(item.id)}
                    />
                  )
                }
              />
              <Card.Content>
                <Text>{item.message}</Text>
                <Text style={styles.timestamp}>
                  {item.timestamp?.toDate().toLocaleString()}
                </Text>
              </Card.Content>
            </Card>
          )}
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
  noNotif: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
