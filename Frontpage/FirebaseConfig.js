// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa5fiFonhu7Hsl3hMHWHxs9fbmGuW8ueE",
  authDomain: "login-651e8.firebaseapp.com",
  projectId: "login-651e8",
  storageBucket: "login-651e8.appspot.com",  // ✅ fixed
  messagingSenderId: "143980563179",
  appId: "1:143980563179:web:aa99622a21b9f8034accae",
  measurementId: "G-9054MRHC5M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence (for Expo)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);

// Export both for global use
export { app, auth, db };
