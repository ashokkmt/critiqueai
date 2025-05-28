import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA3yHqmSfCnm4VOwP61DasfTvX4Tku414Y",
  authDomain: "instant-theater-449913-h4.firebaseapp.com",
  databaseURL: "https://instant-theater-449913-h4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "instant-theater-449913-h4",
  storageBucket: "instant-theater-449913-h4.firebasestorage.app",
  messagingSenderId: "952301619936",
  appId: "1:952301619936:web:7e6fb04a7edaab4e6d1e85",
  measurementId: "G-QLF53ETE3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app)
export const analytics = getAnalytics(app);

export default app;