import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";

function CustomDrawerContent(props) {
  const router = useRouter();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Home"
        icon={({ color }) => (
          <Ionicons name="home-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/tabs/home")}
      />
      <DrawerItem
        label="Wishlist"
        icon={({ color }) => (
          <Ionicons name="heart-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/tabs/wishlist")}
      />
      <DrawerItem
        label="Cart"
        icon={({ color }) => (
          <Ionicons name="cart-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/tabs/addtocart")}
      />
      <DrawerItem
        label="Product"
        icon={({ color }) => (
          <Ionicons name="pricetag-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/auth/product/product")}
      />
      <DrawerItem
        label="Profile"
        icon={({ color }) => (
          <Ionicons name="person-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/tabs/profile")}
      />
      <DrawerItem
        label="Settings"
        icon={({ color }) => (
          <Ionicons name="settings-outline" color={color} size={22} />
        )}
        onPress={() => router.push("/tabs/settings")}
      />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: "#ff3366",
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        <Drawer.Screen
          name="tabs"
          options={{
            drawerLabel: "Main Tabs",
            title: "Main Tabs",
          }}
        />
      </Drawer>
    </PaperProvider>
  );
}
