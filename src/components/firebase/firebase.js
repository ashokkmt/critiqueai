import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVr53-hrEKoYic27L7aBBjF-tqQG3Z070",
  authDomain: "loginsetup23.firebaseapp.com",
  projectId: "loginsetup23",
  storageBucket: "loginsetup23.firebasestorage.app",
  messagingSenderId: "230490400310",
  appId: "1:230490400310:web:ca49f2e3c609b348c75a97"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app)

export default app;