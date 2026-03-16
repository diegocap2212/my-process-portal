import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyClC8dBIf10iktFmMtgmJQHQDzGkHvCLh8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "torre-lm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "torre-lm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "torre-lm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "286848825985",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:286848825985:web:b1cf31b41bef4130442b80",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

