// ✅ Import Firebase SDKs
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa5fiFonhu7Hsl3hMHWHxs9fbmGuW8ueE",
  authDomain: "login-651e8.firebaseapp.com",
  projectId: "login-651e8",
  storageBucket: "login-651e8.firebasestorage.app",
  messagingSenderId: "143980563179",
  appId: "1:143980563179:web:aa99622a21b9f8034accae",
  measurementId: "G-9054MRHC5M",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Export instances
export { auth, db };
