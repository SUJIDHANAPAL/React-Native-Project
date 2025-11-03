// ✅ Import Firebase SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCa5fiFonhu7Hsl3hMHWHxs9fbmGuW8ueE",
  authDomain: "login-651e8.firebaseapp.com",
  projectId: "login-651e8",
  storageBucket: "login-651e8.firebasestorage.app",
  messagingSenderId: "143980563179",
  appId: "1:143980563179:web:aa99622a21b9f8034accae",
  measurementId: "G-9054MRHC5M",
};

// ✅ Initialize Firebase safely (avoid reinitialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Auth with AsyncStorage persistence (React Native only)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  // If already initialized, just get the existing instance
  auth = getAuth(app);
}

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Export for use in other files
export { app, auth, db };
