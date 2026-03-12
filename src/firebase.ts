import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClC8dBIf10iktFmMtgmJQHQDzGkHvCLh8",
  authDomain: "torre-lm.firebaseapp.com",
  projectId: "torre-lm",
  storageBucket: "torre-lm.firebasestorage.app",
  messagingSenderId: "286848825985",
  appId: "1:286848825985:web:b1cf31b41bef4130442b80",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
