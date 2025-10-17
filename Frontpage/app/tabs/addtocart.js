import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const initialCartItems = [
  {
    id: '1',
    title: 'Smartphone',
    description: 'Latest Android model, 128GB storage',
    image: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRyNRKduQQKQcjYGKm4hYtPu6WK8xyLbjynK34rSan5kdDF-A53RuEdg7TjENGgR_EpqXwdIlMjVqwmJfAggbT-UV8UG0Xa8Cc1u_10EsDbJRBQhbPrZWyaeUVgQy3v8QmlNCZ-PQ&usqp=CAc',
    price: 699,
  },
 
];

export default function AddToCart() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`${item.description} - $${item.price}`}
      />
      <Card.Actions>
        <Button onPress={() => removeFromCart(item.id)}>Remove</Button>
      </Card.Actions>
    </Card>
  );

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        My Cart
      </Text>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <Text style={styles.total}>Total: ${totalPrice.toFixed(2)}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginTop:30,
  },
  card: {
    marginBottom: 16,
    
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  total: {
    marginTop: 10,
    fontSize: 18,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
