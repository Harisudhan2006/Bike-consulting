import { initializeApp } from "firebase/app";

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

export { app };
