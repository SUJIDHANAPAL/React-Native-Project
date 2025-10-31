import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Login" }} />
      <Stack.Screen name="auth/Register" options={{ title: "Register" }} />
      <Stack.Screen name="admin/AddProduct" options={{ title: "Add Product" }} />
    </Stack>
  );
}
