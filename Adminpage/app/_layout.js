import { Stack } from "expo-router";
import { deactivateKeepAwake } from "expo-keep-awake";
deactivateKeepAwake();


export default function Layout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
     
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="auth/Register" options={{ title: "Register" }} />
      <Stack.Screen name="admin/AddProduct" options={{ title: "Add Product" }} />
      <Stack.Screen name="admin/Dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="admin/Categories" options={{ title: "Categories" }} />
      <Stack.Screen name="admin/Subcategories" options={{ title: "Subcategories" }} />
      <Stack.Screen name="admin/Tags" options={{ title: "Tags" }} />
      <Stack.Screen name="admin/Catalogue" options={{ title: "Catalogue" }} />
      <Stack.Screen name="admin/AdminOrders" options={{ title:"AdminOrder"}} />
       <Stack.Screen name="admin/Coupon" options={{ title:"Coupon"}} />
   </Stack>
  );
}
