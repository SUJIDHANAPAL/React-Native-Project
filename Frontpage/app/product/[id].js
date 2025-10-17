// app/product/[id].js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Image, StyleSheet, ScrollView, Button } from 'react-native';

export default function ProductDescription() {
  const { id, name, price, img } = useLocalSearchParams(); 
   const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: img }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>{price}</Text>
      <Text style={styles.description}>
        {/* Add more details or fetch using ID */}
        This is the detailed description for {name}.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: '#ff3366',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});
