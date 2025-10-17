import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#ff3366',
        drawerLabelStyle: { fontSize: 16 },
      }}
    >
      {/* The (tabs) folder will render your bottom tabs */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      {/* Extra screens that open from the drawer */}
      <Drawer.Screen
        name="about"
        options={{
          title: 'About',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
