// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);