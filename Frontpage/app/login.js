import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { auth } from '../FirebaseConfig'; // Make sure this exports your Firebase auth instance
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const router = useRouter();

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        // Signed in
        const user = userCredential.user;
        // Navigate to the start screen after successful login
        router.push('/start');
      })
      .catch(error => {
        // Handle Errors here.
        let message = '';
        switch (error.code) {
          case 'auth/invalid-email':
            message = 'Invalid email address format.';
            break;
          case 'auth/user-not-found':
            message = 'No user found with this email.';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
          default:
            message = error.message;
        }
        Alert.alert('Login Error', message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        label="Username or Email"
        mode="outlined"
        style={styles.input}
        left={<TextInput.Icon icon="account" />}
        value={email}
        onChangeText={setEmail}
      />

      {/* Password */}
      <TextInput
        label="Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry={!passwordVisible}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={passwordVisible ? 'eye-off' : 'eye'}
            onPress={() => setPasswordVisible(!passwordVisible)}
          />
        }
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password */}
      <Link href="/forgotpassword" asChild>
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
      </Link>

      {/* Login Button */}
      <Button
        mode="contained"
        style={styles.button}
        onPress={handleLogin}
        contentStyle={{ paddingVertical: 6 }}
      >
        Login
      </Button>

      {/* OR divider */}
      <Text style={styles.or}>- OR Continue with -</Text>

      {/* Social Logins */}
      <View style={styles.socials}>
        <Text> Google | Apple | Facebook </Text>
      </View>

      {/* Register */}
      <Link href="/register" asChild>
        <TouchableOpacity>
          <Text style={styles.bottomText}>
            Create An Account <Text style={styles.link}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 15 },
  forgot: { textAlign: 'right', color: '#f43f5e', marginBottom: 10 },
  button: { backgroundColor: '#f43f5e', marginVertical: 10 },
  or: { textAlign: 'center', marginVertical: 15 },
  socials: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  bottomText: { textAlign: 'center' },
  link: { color: '#f43f5e', fontWeight: 'bold' },
});
