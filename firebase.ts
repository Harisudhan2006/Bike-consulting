import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCzEkUAmJ2-9zHj3cIB3x8g5xE3lQqK2S0",
  authDomain: "bike-consulting.firebaseapp.com",
  projectId: "bike-consulting",
  storageBucket: "bike-consulting.firebasestorage.app",
  messagingSenderId: "274405500379",
  appId: "1:274405500379:web:2a63a6e2c306f521c7b3fe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
