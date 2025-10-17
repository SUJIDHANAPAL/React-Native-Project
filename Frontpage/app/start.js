import { View, ImageBackground, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useRouter } from "expo-router";


export default function GetStartedScreen() {
  const router = useRouter();
  
const gotoHome = ()=>{
    router.push('/tabs/home')
}   


  return (
    <ImageBackground
      source={require("../assets/img/start.jpg")}
      style={styles.bg }
    >
      <View style={styles.overlay}>
        <Text variant="headlineMedium" style={styles.text}>
          You want Authentic, here you go!
        </Text>
        <Button
          mode="contained"
          onPress={gotoHome}
          style={styles.button}
        >
          Get Started
        </Button>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: "flex-end" },
  overlay: { padding: 50  
  },
  text: { color: "white", marginBottom: 50 },
  button: { backgroundColor: "#ff3366",marginTop:-20 },
});
