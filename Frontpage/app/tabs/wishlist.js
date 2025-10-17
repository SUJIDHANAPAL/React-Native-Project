import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const initialWishlist = [
  {
    id: '1',
    title: 'MacBook Pro',
    description: 'Apple M3 Pro chip, 16GB RAM',
    image: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mba13-midnight-cto-hero-202503?wid=840&hei=498&fmt=jpeg&qlt=90&.v=Q2E5SzQzQ0daYWpuZGNscHpUSFFEZktybEU1S0RNR1JRamRyTlliVTJCd2VSQkVmNWJCc0NzWFZ1VVFQblZWdnZvdUZlR0V0VUdJSjBWaDVNVG95YkVTMzRwekd2aEllbUhqT2JVR2ZFU3M',
  },
 
];

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const removeItem = (id) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title title={item.title} subtitle={item.description} />
      <Card.Actions>
        <Button onPress={() => removeItem(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Wishlist
      </Text>

      {wishlist.length === 0 ? (
        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 16,
    
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
    marginTop:30,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
