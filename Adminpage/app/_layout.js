import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="auth/Register" options={{ title: "Register" }} />
      <Stack.Screen name="admin/AddProduct" options={{ title: "Add Product" }} />
      <Stack.Screen name="admin/Dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="admin/Categories" options={{ title: "Categories" }} />
      <Stack.Screen name="admin/Subcategories" options={{ title: "Subcategories" }} />
      <Stack.Screen name="admin/Tags" options={{ title: "Tags" }} />
      <Stack.Screen name="admin/Catalogue" options={{ title: "Catalogue" }} />
   </Stack>
  );
}
