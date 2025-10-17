// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {initializeAuth, getReactNativePersistence, } from "firebase/auth"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCa5fiFonhu7Hsl3hMHWHxs9fbmGuW8ueE",
  authDomain: "login-651e8.firebaseapp.com",
  projectId: "login-651e8",
  storageBucket: "login-651e8.firebasestorage.app",
  messagingSenderId: "143980563179",
  appId: "1:143980563179:web:aa99622a21b9f8034accae",
  measurementId: "G-9054MRHC5M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app,{
Persistence : getReactNativePersistence(ReactNativeAsyncStorage)
});