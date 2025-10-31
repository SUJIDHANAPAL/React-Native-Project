// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

// ✅ Export Auth & Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
