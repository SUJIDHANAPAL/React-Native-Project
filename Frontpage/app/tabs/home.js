
import React from "react";
import { View, ScrollView, Image, StyleSheet, FlatList, TextInput, TouchableOpacity, Pressable } from "react-native";
import { Text, Card, Button, Avatar, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from "@react-navigation/native";


const categories = [
  { id: 1, name: "Women", img: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" },
  { id: 2, name: "Men", img: "https://images.pexels.com/photos/1337477/pexels-photo-1337477.jpeg" },
  { id: 3, name: "Kids", img: "https://media.istockphoto.com/id/1154728763/photo/cheerful-kids-in-stylish-outfits.jpg?s=612x612&w=is&k=20&c=xbe07h0p7TLwJFF2A95Q8EhgVkwRBl1fqlgAOjGb34A=" },
  { id: 4, name: "Shoes", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPLSu-_o3HVm6Sibc8y1RQtsY0oXK3UmMnWqoJac9KCbhCpYA8pNztgOQ&s" },
  { id: 5, name: "Accessories", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2grI_f50heLYIjlC-tQbJKWI_LT42BEcVTaMf4rTCwHFzxSWqW3Mjv7c&s" },
];

const trendingProducts = [
  {
    id: 1,
    name: "Stylish Watch",
    price: "₹999",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/watch/t/w/i/-original-imahfsz9bqgqdxzd.jpeg?q=70",
  },
  {
    id: 2,
    name: "Leather Wallet",
    price: "₹499",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/wallet-card-wallet/o/e/p/-original-imah4c69hr9fgbgy.jpeg?q=70",
  },
  {
    id: 3,
    name: "Sneakers",
    price: "₹1,299",
    img: "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/d/g/n/10-8563-10-killer-green-original-imaheppugddhqged.jpeg?q=70",
  },
];

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();

  const goToProfile = () => {
    router.push("/tabs/profile");
  };

  const bestProduct = {
    id: 101,
    name: "Stylish Sneakers",
    price: "₹1,299",
    img: "https://img.freepik.com/free-photo/fashion-shoes-sneakers_1203-7529.jpg",
  };

  return (
    <ScrollView style={{ backgroundColor: "#fff" }} showsVerticalScrollIndicator={false}>

      {/* Header Bar */}
      <View style={styles.topBar}>
        <Ionicons name="menu-outline" size={26} color="#333" 
         onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
        <Text variant="titleLarge" style={{ fontWeight: "bold", color: "#ff3366" }}>
         Stylish studio
        </Text>
        <TouchableOpacity onPress={goToProfile}>
          <Avatar.Image
            size={40}
            source={{ uri: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png" }}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#999" />
        <TextInput
          placeholder="Search for products"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Avatar.Image size={55} source={{ uri: item.img }} />
            <Text style={styles.categoryText}>{item.name}</Text>
          </View>
        )}
      />

      {/* Offer Banner */}
      <Card style={styles.bannerCard}>
        <View style={styles.sliderContainer}>
          <Swiper autoplay autoplayTimeout={3} showsPagination dotColor="#ccc" activeDotColor="#ff3366">
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/fashion-sale-banner-template_23-2148981144.jpg' }}
              style={styles.slideImage}
            />
            <Image
              source={{ uri: 'https://img.freepik.com/free-vector/summer-sale-background-with-beach-elements_52683-15402.jpg' }}
              style={styles.slideImage}
            />
            <Image
              source={{ uri: 'https://img.freepik.com/free-photo/young-woman-shopping_23-2148010159.jpg' }}
              style={styles.slideImage}
            />
          </Swiper>
        </View>
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>50–60% OFF</Text>
          <Button mode="contained" buttonColor="#ff3366" style={styles.shopBtn}>
            Shop Now
          </Button>
        </View>
      </Card>

      {/* Best of the Day */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Best of the Day</Text>
        <Pressable onPress={() => router.push({ pathname: `/product/${bestProduct.id}`, params: bestProduct })}>
          <Card style={styles.dealCard}>
            <Card.Cover source={{ uri: bestProduct.img }} />
            <Card.Content>
              <Text variant="titleSmall">{bestProduct.name}</Text>
              <Text style={{ color: theme.colors.primary }}>{bestProduct.price}</Text>
            </Card.Content>
          </Card>
        </Pressable>
      </View>

      {/* Trending Products */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Trending Products</Text>
        <FlatList
          horizontal
          data={trendingProducts}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push({ pathname: `/product/${item.id}`, params: item })}>
              <Card style={styles.trendingCard}>
                <Card.Cover source={{ uri: item.img }} />
                <Card.Content>
                  <Text>{item.name}</Text>
                  <Text style={{ color: "#ff3366" }}>{item.price}</Text>
                </Card.Content>
              </Card>
            </Pressable>
          )}
        />
      </View>

      {/* Sale Banner */}
      <Card style={styles.saleBanner}>
        <Image
          source={{ uri: "https://img.freepik.com/free-vector/flat-sale-background-with-photo_23-2149006712.jpg" }}
          style={styles.saleImage}
        />
      </Card>

      {/* New Arrivals */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>New Arrivals</Text>
        <Card style={styles.arrivalCard}>
          <Card.Cover source={{ uri: "https://indian-retailer.s3.ap-south-1.amazonaws.com/s3fs-public/inline-images/W_Image%2002.jpg" }} />
          <Card.Content>
            <Text>Summer Collection</Text>
            <Button textColor="#ff3366">Explore</Button>
          </Card.Content>
        </Card>
      </View>

      {/* Sponsored */}
      <Card style={styles.sponsoredCard}>
        <Card.Cover source={{ uri: "https://www.westside.com/cdn/shop/articles/summer_casuals_for_men_by_wes_c.png?v=1646466676" }} />
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>UP TO 50% OFF</Text>
        </View>
      </Card>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",

    alignItems: "center",
    backgroundColor: "#f3f3f3",
    flex: 1,
    marginHorizontal: 15,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop:10,
    marginBottom:25,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  categoryList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
  },

  sliderContainer: {
  height: 200,
  width: '100%',
  
  justifyContent: 'center',
  alignSelf: 'center',
},

slideImage: {
  width: '100%',
  height: '100%',
  borderRadius: 12,
  alignSelf: 'center',
},

  bannerCard: {
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 10,
    left: 20,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  shopBtn: {
    marginTop: 6,
    borderRadius: 8,
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
  dealCard: {
    borderRadius: 12,
  },
  trendingCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
  },
  saleBanner: {
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  saleImage: {
    width: "100%",
    height: 120,
  },
  arrivalCard: {
    borderRadius: 12,
  },
  sponsoredCard: {
    margin: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },
  overlayText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  
});
