import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbpzYBU5a4kixUeCPvyzJPfCHTn3H10q8",
  authDomain: "rockquest-sg.firebaseapp.com",
  projectId: "rockquest-sg",
  storageBucket: "rockquest-sg.firebasestorage.app",
  messagingSenderId: "412827412582",
  appId: "1:412827412582:web:6dd3e12a3d6c5bd70ae5a7",
  measurementId: "G-ZD6XEVJXW7"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP)
export const FIRESTORE = getFirestore(FIREBASE_APP)
export const FIRESTORE_DB = getStorage(FIREBASE_APP)